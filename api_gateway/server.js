const express = require('express');
const cors = require('cors');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api-gateway' });
});

app.use('/api/auth', (req, res, next) => {
    console.log('Routing to User Service:', process.env.USER_SERVICE_URL);
    next();
  }, createProxyMiddleware({
    target: process.env.USER_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      '^/api/auth': '/api' // This is correct but might not be working as expected
    },
    logLevel: 'debug'
  }));

app.use('/api/blog', createProxyMiddleware({
  target: process.env.BLOG_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/blog': '/api' // Rewrite path
  }
}));

app.get('/api/protected', verifyToken, (req, res) => {
  res.json({ 
    message: 'Protected data accessed successfully',
    user: req.user
  });
});

app.get('/api/posts-with-authors', async (req, res) => {
  try {
    const postsResponse = await axios.get(`${process.env.BLOG_SERVICE_URL}/api/posts`);
    const posts = postsResponse.data;
    
    if (!posts.length) {
      return res.json([]);
    }
    
    const authorIds = [...new Set(posts.map(post => post.authorId).filter(id => id))];
    
    if (!authorIds.length) {
      return res.json(posts);
    }
    
    const authorsPromises = authorIds.map(authorId => 
      axios.get(`${process.env.USER_SERVICE_URL}/api/users/?id=${authorId}`)
        .catch(() => ({ data: [] }))
    );
    
    const authorsResponses = await Promise.all(authorsPromises);
    
    const authorsMap = {};
    authorsResponses.forEach(response => {
      if (response.data.length) {
        const author = response.data[0];
        authorsMap[author.id] = author;
      }
    });
    
    const postsWithAuthors = posts.map(post => ({
      ...post,
      author: post.authorId ? authorsMap[post.authorId] : null
    }));
    
    res.json(postsWithAuthors);
  } catch (error) {
    console.error('Error fetching posts with authors:', error);
    res.status(500).json({ error: 'Failed to fetch posts with authors' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});