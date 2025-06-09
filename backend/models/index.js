import db from "../config/Database.js";
import User from "./UserModel.js";
import Report from "./ReportModel.js";

// Define associations
User.hasMany(Report, { 
    foreignKey: 'user_id', 
    as: 'reports' 
});

Report.belongsTo(User, { 
    foreignKey: 'user_id', 
    as: 'user' 
});

// Sync database
(async () => {
    try {
        await db.sync({ alter: true }); // Use { force: true } only in development to recreate tables
        console.log('✅ All models were synchronized successfully.');
    } catch (error) {
        console.error('❌ Unable to sync models:', error);
    }
})();

export { User, Report };