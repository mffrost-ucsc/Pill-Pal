# Pill-Pal
A prescription management and reminder app.


## Setup

### Reqirements

- Docker: The backend will run in a Docker container
    - Install Here: https://docs.docker.com/get-docker/
    - Make sure you also have the mysql image by using the command line:
    
        ```$ docker pull mysql ```
        
- Node.js: A JavaScript runtime for building the front end
    - Install Here: https://nodejs.org/en 
- React Native CLI: The framework for our frontend
    - Install Here: https://reactnative.dev/docs/environment-setup?platform=ios 
    - You can install for either ios or android; it shouldn't matter which
- Python: Required for creating the backend server with Flask
    - Install Here: https://www.python.org/ 


### Backend
To set up the backend, navigate to the backend directory and run:

    $ docker-compose build --no-cache
    $ docker-compose up -d
    
After making changes to the server you can rebuild the images with:

    $ docker-compose up -d --build

If you need to reset the backend to it's inital state (i.e. the database will be reset to **only what's in the init folder**): navigate to the backend directory, **delete the data folder in the database directory**, and run:

    $ docker-compose down -v
    $ docker-compose build --no-cache
    $ docker-compose up -d
    

The database can be connected to and edited via MySQL Workbench. Instructions are here: https://medium.com/@chrischuck35/how-to-create-a-mysql-instance-with-docker-compose-1598f3cc1be

When you are done working, run:

    $ docker-compose down -v
  
### Frontend
Once you have React Native installed and a simulator set up (either with XCode or Andriod Studio; see the React Native CLI link for more details), navigate to the frontend directory and run:
    ```$ npm start```
    
This should launch Metro, which will give you options for launching the app (type i for ios or a for andriod). This should open the simulator and update the display automatically when the code changes. Make sure the backend docker containers are running if you want any server requests to work. 

When you are done simply close the simulator and stop Metro. 
