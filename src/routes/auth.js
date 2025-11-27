const express = require('express');
const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken, authenticateToken } = require('../middleware/auth');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Informe nome, email e senha' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Senha deve ter pelo menos 6 caracteres' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'Email já registrado' });
    }

    const hash = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: { name, email, passwordHash: hash },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    const token = generateToken(user.id);
    return res.status(201).json({ user, token });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao registrar', error: 'INTERNAL_ERROR' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Informe email e senha' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    const token = generateToken(user.id);
    return res.json({
      user: { id: user.id, name: user.name, email: user.email },
      token
    });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao autenticar', error: 'INTERNAL_ERROR' });
  }
});

router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(req.user.id) },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    return res.json({ user });
  } catch (error) {
    return res.status(500).json({ message: 'Erro ao obter usuário', error: 'INTERNAL_ERROR' });
  }
});

module.exports = router;

