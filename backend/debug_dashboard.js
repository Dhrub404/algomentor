require('dotenv').config();
const mongoose = require('mongoose');
const dashboard = require('./controllers/dashboardController');
const User = require('./models/User');
(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const user = await User.findOne({ email: 'test@algomentor.com' });
    if (!user) throw new Error('User not found');
    const req = { user: { _id: user._id.toString() }, params: {} };
    const res = {
      statusCode: 200,
      data: null,
      status(code) { this.statusCode = code; return this; },
      json(obj) { this.data = obj; console.log('RESPONSE', JSON.stringify(obj, null, 2)); return this; }
    };
    await dashboard.getWeaknessDiagnostics(req, res);
  } catch (err) {
    console.error('ERROR STACK:', err.stack || err);
  } finally {
    await mongoose.disconnect();
  }
})();
