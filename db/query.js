const mysql = require("mysql2");
const inquirer = require("inquirer");
require('dotenv').config();

class Data {
    // Create connection
    constructor() {
        this.db = mysql.createConnection({
            host: process.env.HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME,
            multipleStatements: true
        }).promise();
    }

    // Close the connection
    async close() {
        await this.db.end();
    }

    async getDepartments() {
        const result = await this.db.query('SELECT * FROM department')
        return result[0];
    }

    async getEmployees() {
        const result = await this.db.query(
            `SELECT
                 employee.id,
                 CONCAT(employee.first_name, " ", employee.last_name) AS employee,
                 r.title,
                 d.department,
                 r.salary,
                 CONCAT(m.first_name, " ", m.last_name) AS manager
             from employee
                      LEFT OUTER JOIN role r ON employee.role_id = r.id
                      LEFT OUTER JOIN department d ON r.department_id = d.id
                      LEFT OUTER JOIN employee m ON employee.manager_id = m.id;`);
        return result[0];
    }

    async getEmployeesByManager() {
        const employees = await this.db.query(
            `SELECT employee.id,
                    CONCAT(employee.first_name, " ", employee.last_name) AS name,
                    (SELECT CONCAT(first_name, " ", last_name)
                     FROM employee AS manager
                     WHERE manager.id = employee.manager_id)             AS manager
             FROM employee`);
        // Sort the view by manager in ascending order
        const sorted = employees[0].sort((a, b) => {
            // null is bigger than a char
            // so that null shows at the end of the list
            if (!a.manager) {
                return 1;
            }
            if (!b.manager) {
                return -1;
            }
            // arrange in ascending order
            return a.manager < b.manager ? -1 : 1;
        });
        return sorted;
    }

    async getEmployeesByDepartment() {
        const employees = await this.db.query(
            `SELECT department.department,
                    CONCAT(employee.first_name, " ", employee.last_name) AS name,
                    role.title,
                    employee.id
             FROM employee,
                  department,
                  role
             WHERE employee.role_id = role.id
               AND role.department_id = department.id`);
        const sorted = employees[0].sort((a, b) => {
            //arrange in ascending order
            return a.department < b.department ? -1 : 1;
        });
        return sorted;
    }

    // doesn't work
    async getRoles() {
        const result = await this.db.query(
            `SELECT role.id, role.title, department.department, role.salary
                FROM role
                LEFT OUTER JOIN department ON department_id = department.id;`);
        return result[0];
    }


    async addDepartment() {
        const {department} = await inquirer.prompt([
            {
                type: "input",
                name: "department",
                message: "What is the name of the department?",
                validate: function (department) {
                    // Check that string is not just whitespace and is not empty
                    let valid = /\S/.test(department) && department.length > 0;
                    if (!valid) {
                        console.log(" (!) Please enter a valid response.");
                    } else {
                        return true;
                    }
                }
            }
        ]);
        await this.db.query(`INSERT INTO department (department)
                             VALUES (?)`, department);
        return department;
    }

    async addRole() {
        const department_choices = await this.getDeptList();
        const {title, salary, department} = await inquirer.prompt([
            {
                type: "input",
                name: "title",
                message: "What is the name of the role?",
                validate: function (department) {
                    // Check that string is not just whitespace
                    let valid = /\S/.test(department) && department.length > 0;
                    if (!valid) {
                        console.log(" (!) Please enter a valid response.");
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "salary",
                message: "What is the salary of the role?",
                validate: function (department) {
                    // Check that string is not just whitespace and is not empty and is not empty and is numbers
                    let valid = /\S/.test(department) && department.length > 0 && /^\d+$/.test(department);
                    if (!valid) {
                        console.log(" (!) Please enter a valid response.");
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "list",
                name: "department",
                message: "Which department does the role belong to?",
                choices: department_choices
            }
        ]);
        await this.db.query(`INSERT INTO role (title, salary, department_id)
                             VALUES (?, ?, ?)`, [title, salary, department]);
        return title;
    }

    async addEmployee() {
        const role_choices = await this.getRoleList();
        const employee_choices = await this.getEmployeeList();
        const {first_name, last_name, department, employee_id} = await inquirer.prompt([
            {
                type: "input",
                name: "first_name",
                message: "What is the employee's first name?",
                validate: function (department) {
                    // Check that string is not just whitespace and is not empty
                    let valid = /\S/.test(department) && department.length > 0;
                    if (!valid) {
                        console.log(" (!) Please enter a valid response.");
                    } else {
                        return true;
                    }
                }
            },
            {
                type: "input",
                name: "last_name",
                message: "What is the employee's last name?",
                validate: function (department) {
                    // Check that string is not just whitespace and is not empty
                    let valid = /\S/.test(department) && department.length > 0;
                    if (!valid) {
                        console.log(" (!) Please enter a valid response.");
                    } else {
                        return true;
                    }
                }
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
        await this.db.query(`INSERT INTO employee (first_name, last_name, role_id, manager_id)
                             VALUES (?, ?, ?, ?)`, [first_name, last_name, department, employee_id]);
        return first_name + " " + last_name;
    }

    async updateRole() {
        const employee_choice = await this.getEmployeeList();
        const role_choices = await this.getRoleList();
        const {employee_id} = await inquirer.prompt([
            {
                type: "list",
                name: "employee_id",
                message: "Which employee's role do you want to update?",
                choices: employee_choice
            }]);
        const userInput = await this.getSelectedEmployee(employee_choice, employee_id);
        const {role_id} = await inquirer.prompt([
            {
                type: "list",
                name: "role_id",
                message: `Which role do you want to assign to ${userInput.name}?`,
                choices: role_choices
            },
        ]);
        await this.db.query(`UPDATE employee
                             SET role_id = (?)
                             WHERE id = (?)`, [role_id, employee_id]);
        return userInput.name;
    }

    // Update employee managers
    async updateManagers() {
        const employee_choice = await this.getEmployeeList();
        const {employee_id} = await inquirer.prompt([
            {
                type: "list",
                name: "employee_id",
                message: "Which employee's manager do you want to update?",
                choices: employee_choice
            }
        ]);
        const possibleManagers = employee_choice.filter((data, index) => index !== employee_choice.findIndex(i => i.value === employee_id));
        const userInput = await this.getSelectedEmployee(employee_choice, employee_id);
        const {manager_id} = await inquirer.prompt([
            {
                type: "list",
                name: "manager_id",
                message: `Which manager do you want to assign to ${userInput.name}?`,
                choices: possibleManagers
            },
        ]);
        await this.db.query(`UPDATE employee
                             SET manager_id = (?)
                             WHERE id = (?)`, [manager_id, employee_id]);
        return userInput.name;
    }

    async delete() {
        const {delete_choice} = await inquirer.prompt([
            {
                type: "list",
                name: "delete_choice",
                message: `What would you like to delete?`,
                choices: ["Department", "Role", "Employee"]
            },
        ]);
        if (delete_choice === "Department") {
            const deletedDept = await this.deleteDept();
            console.log(`${deletedDept} has been deleted`);
        } else if (delete_choice === "Role") {
            const deletedRole = await this.deleteRole();
            console.log(`${deletedRole} has been deleted`);
        } else if (delete_choice === "Employee") {
            const deletedEmp = await this.deleteEmp();
            console.log(`${deletedEmp} has been deleted`);
        }
    }

    async deleteDept() {
        const depts = await this.getDeptList();
        const {dept_id} = await inquirer.prompt([
            {
                type: "list",
                name: "dept_id",
                message: "Select a department to delete:",
                choices: depts
            }
        ]);
        const deletedDept = depts.find(i => i.value === dept_id);
        await this.db.query(`DELETE FROM department WHERE id = (?)`,[deletedDept.value]);
        return deletedDept.name;
    }

    async deleteRole(){
        const roles = await this.getRoleList();
        const {role_id} = await inquirer.prompt([
            {
                type: "list",
                name: "role_id",
                message: "Select a role to delete:",
                choices: roles
            }
        ]);
        const deletedRole = roles.find(i => i.value === role_id);
        await this.db.query(`DELETE FROM role WHERE id = (?)`,[deletedRole.value]);
        return deletedRole.name;
    }

    async deleteEmp(){
        const emps = await this.getEmployeeList();
        const {emp_id} = await inquirer.prompt([
            {
                type: "list",
                name: "emp_id",
                message: "Select an employee to delete:",
                choices: emps
            }
        ]);
        const deletedEmp = emps.find(i => i.value === emp_id);
        await this.db.query(`DELETE FROM employee WHERE id = (?)`,[deletedEmp.value]);
        return deletedEmp.name;
    }

    async budget(){
        const result = await this.db.query(`SELECT department,
                                    SUM(salary) AS total_budget
                             FROM employee
                                      LEFT OUTER JOIN role r ON employee.role_id = r.id
                                      LEFT OUTER JOIN department d ON r.department_id = d.id
                             GROUP BY department;`)
        return result[0];
    }


    // Get a list of roles
    async getRoleList() {
        const roles = await this.getRoles();
        return roles.map(value => ({
            name: value.title,
            value: value.id
        }));
    }

    // Get a list of employees
    async getEmployeeList() {
        const employees = await this.getEmployees();
        return employees.map(value => ({
            name: value.employee,
            value: value.id
        }));
    }

    async getDeptList() {
        const departments = await this.getDepartments();
        return departments.map(value => ({
            name: value.department,
            value: value.id
        }));
    }

    // Get the employee that the user selected in their prompt
    async getSelectedEmployee(array, id) {
        return array.find(i => i.value === id);
    }
}

module.exports = Data;