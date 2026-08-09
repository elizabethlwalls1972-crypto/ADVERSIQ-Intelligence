// Authentication API Routes
import { Router, Request, Response } from 'express';
import { queryOne, query } from '../db.js';
import { generateToken, generateRefreshToken, verifyToken, hashPassword, verifyPassword, requireAuth } from '../middleware/auth.js';
import { validateBody, authValidation } from '../middleware/validate.js';

const router = Router();

// ─── Register ────────────────────────────────────────────────────────────────

router.post('/register', validateBody(authValidation.register), async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Invalid email format.' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters.' });
    }

    if (password.length > 128) {
      return res.status(400).json({ error: 'Password too long (max 128 characters).' });
    }

    // Check if email exists
    const existing = await queryOne<{ id: string }>('SELECT id FROM users WHERE email = $1', [email.toLowerCase().trim()]);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Create user
    const passwordHash = await hashPassword(password);
    const user = await queryOne<{ id: string; email: string; name: string; role: string }>(`
      INSERT INTO users (email, name, password_hash, role)
      VALUES ($1, $2, $3, 'user')
      RETURNING id, email, name, role
    `, [email.toLowerCase().trim(), (name || '').trim(), passwordHash]);

    if (!user) {
      return res.status(500).json({ error: 'Failed to create account.' });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Registration failed.' });
  }
});

// ─── Login ───────────────────────────────────────────────────────────────────

router.post('/login', validateBody(authValidation.login), async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    // Find user
    const user = await queryOne<{
      id: string;
      email: string;
      name: string;
      role: string;
      password_hash: string;
    }>('SELECT id, email, name, role, password_hash FROM users WHERE email = $1', [email.toLowerCase().trim()]);

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Verify password
    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = generateToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token,
      refreshToken,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed.' });
  }
});

// ─── Refresh Token ───────────────────────────────────────────────────────────

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required.' });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid or expired refresh token.' });
    }

    const user = await queryOne<{ id: string; email: string; name: string; role: string }>(
      'SELECT id, email, name, role FROM users WHERE id = $1',
      [decoded.id]
    );

    if (!user) {
      return res.status(401).json({ error: 'User not found.' });
    }

    const newToken = generateToken(user);
    const newRefreshToken = generateRefreshToken(user);

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ error: 'Token refresh failed.' });
  }
});

// ─── Get Current User ────────────────────────────────────────────────────────

router.get('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const user = await queryOne<{
      id: string;
      email: string;
      name: string;
      role: string;
      created_at: string;
    }>('SELECT id, email, name, role, created_at FROM users WHERE id = $1', [req.user!.id]);

    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const reportCount = await queryOne<{ count: string }>(
      'SELECT COUNT(*) as count FROM reports WHERE user_id = $1',
      [user.id]
    );

    res.json({
      ...user,
      reportCount: parseInt(reportCount?.count || '0'),
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to get user info.' });
  }
});

// ─── Update Profile ──────────────────────────────────────────────────────────

router.patch('/me', requireAuth, async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (name && (typeof name !== 'string' || name.length > 100)) {
      return res.status(400).json({ error: 'Name must be a string under 100 characters.' });
    }

    const user = await queryOne<{ id: string; email: string; name: string; role: string }>(`
      UPDATE users SET name = COALESCE($1, name), updated_at = NOW()
      WHERE id = $2
      RETURNING id, email, name, role
    `, [name?.trim() || null, req.user!.id]);

    res.json(user);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile.' });
  }
});

// ─── Change Password ─────────────────────────────────────────────────────────

router.post('/change-password', requireAuth, validateBody(authValidation.changePassword), async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required.' });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const user = await queryOne<{ password_hash: string }>(
      'SELECT password_hash FROM users WHERE id = $1',
      [req.user!.id]
    );

    if (!user || !(await verifyPassword(currentPassword, user.password_hash))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const newHash = await hashPassword(newPassword);
    await query('UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2', [newHash, req.user!.id]);

    res.json({ success: true, message: 'Password changed successfully.' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password.' });
  }
});

export default router;
