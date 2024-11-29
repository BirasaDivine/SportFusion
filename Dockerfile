# Use the official Nginx image as the base image
FROM nginx:alpine

# Copy the custom Nginx configuration file (optional, if customization is needed)
# COPY nginx.conf /etc/nginx/nginx.conf

# Copy your HTML, CSS, and JS files to the appropriate directory
COPY . /usr/share/nginx/html

# Expose port 80 to be accessible
EXPOSE 80

# Start Nginx when the container starts
CMD ["nginx", "-g", "daemon off;"]
