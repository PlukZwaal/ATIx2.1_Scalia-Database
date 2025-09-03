const express = require('express');
const router = express.Router();

// Direct doorsturen naar index pagina zonder database query
router.get('/', (req, res) => {
  // Render direct de index pagina zonder data
  res.render('index', { 
    title: 'Home',
    customers: [] // Lege array voor customers
  });
});

module.exports = router;