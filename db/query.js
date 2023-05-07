const mysql = require("mysql2");
const inquirer = require("inquirer");
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

    async addDepartment() {
        const {department} = await inquirer.prompt([
            {
                type: "input",
                name: "department",
                message: "What is the name of the department?"
            }
        ]);
        await this.db.query(`INSERT INTO department (department) VALUES (?)`, department);
        return department;
    }
    async addRole() {
        const departments = await this.getDepartments();
        const department_choices = departments.map(value => ({
            name: value.department,
            value: value.id
        }));

        // { id: number; department: string }[]
        const {title, salary, department} = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "What is the name of the role?"
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary of the role?"
            },
            {
                type: "list",
                name: "department",
                message: "Which department does the role belong to?",
                choices: department_choices
            }
        ]);
        await this.db.query(`INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`, [title, salary, department]);
        return title;
    }
    async addEmployee(){
        const role_choices = await this.getRoleList();
        const employee_choices = await this.getEmployeeList();
        const {first_name, last_name, department, employee_id} = await inquirer.prompt([
            {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?"
            },
            {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?"
            },
            {
                type: "list",
                name: "department",
                message: "What is the employee's role?",
                choices: role_choices
            },
            {
                type: "list",
                name: "employee_id",
                message: "Who is employee's manager?",
                choices: employee_choices
            }
        ]);
        await this.db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?)`, [first_name, last_name, department, employee_id]);
        return first_name + " " + last_name;
    }

    async updateRole() {
        const employee_choice = await this.getEmployeeList();
        const role_choices = await this.getRoleList();
        const {employee_id, role_id} = await inquirer.prompt([
            {
                type: "list",
                name: "employee_id",
                message: "Which employee's role do you want to update?",
                choices: employee_choice
            },
            {
                type: "list",
                name: "role_id",
                message: "Which role do you want to assign the selected employee?",
                choices: role_choices
            },
        ]);
        await this.db.query(`UPDATE employee SET role_id = (?) WHERE id = (?)`, [role_id, employee_id]);
        const userInput = employee_choice.find(i => i.value === employee_id);
        return userInput.name;
    }

    // async getRolePrompt() {
    //     return {
    //         type: "list",
    //         name: "role_id",
    //         message: "Which role do you want to assign the selected employee?",
    //         choices: await this.getRoleList(),
    //     }
    // }

    async getRoleList(){
        const roles = await this.getRoles();
        return roles.map(value => ({
            name: value.title,
            value: value.id
        }));
    }

    async getEmployeeList(){
        const employees = await this.getEmployees();
        return employees.map(value => ({
            name: value.first_name + " " + value.last_name,
            value: value.id
        }));
    }
}

module.exports = Data;