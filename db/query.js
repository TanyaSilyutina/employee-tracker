const mysql = require("mysql2");
require('dotenv').config();

class Data {
    constructor() {
        this.db = mysql.createConnection({
            host: process.env.HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        }).promise();
    }

    async close() {
        await this.db.end();
    }

    async getDepartments() {
        const result = await this.db.query('SELECT * FROM department')
        return result[0];
    }

    async getEmployees() {
        const result = await this.db.query(
            `SELECT employee.id,
                    employee.first_name,
                    employee.last_name,
                    role.title,
                    department.department,
                    role.salary,
                    (SELECT CONCAT(first_name, " ", last_name)
                     FROM employee AS manager
                     where manager.id = employee.manager_id) as manager
             FROM employee,
                  role,
                  department
             WHERE employee.role_id = role.id
               AND role.department_id = department.id
             ORDER BY role.id;`);
        return result[0];
    }

    async getRoles() {
        const result = await this.db.query(
            `SELECT role.id, role.title, department.department, role.salary
             FROM role,
                  department
             WHERE role.department_id = department.id
             ORDER BY role.id;`);
        return result[0];
    }
}


module.exports = Data;