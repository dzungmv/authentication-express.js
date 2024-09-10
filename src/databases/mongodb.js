const mongoose = require("mongoose");

const connect = `mongodb+srv://dungmvnow:${process.env.MONGO_PASSWORD}@ecommerce.mgwrl.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Ecommerce`;

class Database {
    constructor() {
        this.connection = null;
    }

    async connect() {
        if (this.connection) return this.connection;
        
        try {
            this.connection = await mongoose.connect(connect);
            console.log('\x1b[32m', '🖖 Connect to DB successfully!');
            return this.connection;
        } catch (err) {
            console.log('\x1b[31m', '>> Error connecting to MongoDB:', err);
            throw err;
        }
    }

    static async getInstance() {
        if (!Database.instance) {
            Database.instance = new Database();
            await Database.instance.connect();
        }
        return Database.instance;
    }
}

module.exports = Database.getInstance();