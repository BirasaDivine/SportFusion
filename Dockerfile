# Use the official Node.js image as the base
FROM node:alpine

# Set the working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json .
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app uses (adjust if needed)
EXPOSE 8080

# Start the application using npm start
CMD ["npm", "start"]
