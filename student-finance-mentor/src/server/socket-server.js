// This file is for reference only - in a real implementation, this would be a separate Node.js server

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Your frontend URL
    methods: ["GET", "POST"]
  }
});

// Keep track of connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // Handle user authentication
  socket.on('authenticate', (userData) => {
    console.log('User authenticated:', userData.displayName);
    connectedUsers.set(socket.id, {
      userId: userData.uid,
      displayName: userData.displayName,
      role: userData.role
    });
    
    // Notify admins about user connection
    socket.broadcast.emit('user_status', {
      userId: userData.uid,
      displayName: userData.displayName,
      status: 'online',
      timestamp: new Date().toISOString()
    });
  });
  
  // Handle invoice updates
  socket.on('update_invoice', (invoice) => {
    console.log('Invoice updated:', invoice.invoiceNumber);
    socket.broadcast.emit('invoice_update', invoice);
  });
  
  // Handle invoice deletion
  socket.on('delete_invoice', (invoiceId) => {
    console.log('Invoice deleted:', invoiceId);
    socket.broadcast.emit('invoice_delete', invoiceId);
  });
  
  // Handle customer updates
  socket.on('update_customer', (customer) => {
    console.log('Customer updated:', customer.name);
    socket.broadcast.emit('customer_update', customer);
  });
  
  // Handle customer deletion
  socket.on('delete_customer', (customerId) => {
    console.log('Customer deleted:', customerId);
    socket.broadcast.emit('customer_delete', customerId);
  });
  
  // Handle activity logging
  socket.on('activity', (activity) => {
    console.log('New activity:', activity.action, activity.entityType);
    socket.broadcast.emit('new_activity', activity);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    const user = connectedUsers.get(socket.id);
    if (user) {
      console.log('User disconnected:', user.displayName);
      
      // Notify admins about user disconnection
      socket.broadcast.emit('user_status', {
        userId: user.userId,
        displayName: user.displayName,
        status: 'offline',
        timestamp: new Date().toISOString()
      });
      
      connectedUsers.delete(socket.id);
    } else {
      console.log('Unknown user disconnected');
    }
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Socket.io server running on port ${PORT}`);
});
