require("dotenv").config();

module.exports = {
    db: {
        host: process.env.DB_HOST || "localhost",
        user: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "Admin123!",
        database: process.env.DB_NAME || "roca_steak",
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
    },
    jwt: {
        secret: process.env.JWT_SECRET || "secreto_super_seguro",
        expiresIn: "8h",
    },
};
