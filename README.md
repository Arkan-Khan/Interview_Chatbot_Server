# Interview Chatbot Server

This is the backend server for the Interview Chatbot. It provides API endpoints for managing chatbot interactions, user authentication, and database operations.

## Installation

### Clone the Repository
```sh
git clone https://github.com/Arkan-Khan/Interview_Chatbot_Server
cd Interview_Chatbot_Server
```

### Install Dependencies
```sh
npm install
```

## Environment Variables
Create a `.env.example` file in the root directory and add the following environment variables:

```env
MONGODB_URI=your_mongodb_connection_string
PORT=your_port_number
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
```

Then rename the file to `.env` and update the values accordingly.

## Running the Server

To start the development server, run:
```sh
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## Contributing
Feel free to fork this repository and submit pull requests with improvements or bug fixes.

## License
This project is licensed under the MIT License.

