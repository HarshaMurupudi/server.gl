import express from 'express';
const Employee = require('../models/Employee');
const router = express.Router();
const jwt = require('jsonwebtoken');

const auth = require('../middleware/auth');

router.get('/user', auth, async (req, res) => {
  try {
    let user = await Employee.findOne({ where: { Employee: req.user.id } });
    res.json(user);
  } catch (err) {
    res.status(500).send('Server Error');
  }
});

router.post('/auth', async (req, res) => {
  const { employeeID, password } = req.body;

  try {
    let user = await Employee.findOne({
      where: { Employee: employeeID, SSN: password, Status: 'Active' },
    });

    if (!user) {
      return res.status(400).json({ errors: [{ msg: 'Invalid credentials' }] });
    }

    const userDetailsJWT = {
      user: {
        id: user.Employee,
      },
    };

    jwt.sign(
      userDetailsJWT,
      // config.get('jwtSecret'),
      'mysecrettoken',
      { expiresIn: 360000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.log(err);
    res.status(500).send('Server error');
  }
});

module.exports = router;
