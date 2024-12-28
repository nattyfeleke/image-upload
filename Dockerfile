# Use Node.js LTS version as the base image
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the build command
RUN npm run build

# Set the working directory to the build output directory (if applicable)
# Uncomment this if your build output is in a specific folder like `dist`
# WORKDIR /usr/src/app/dist

# Expose the application port
EXPOSE 3000

# Define the command to start the application
CMD ["npm", "start"]
