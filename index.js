const inquirer = require("inquirer");
const path = require('path');
const fs = require('fs');
const cTable = require('console.table');
const db = require('./config/connection.js');
const greet = require('./Assets/welcome');

async function init() {
    await greet();
    while (true) {
        const {choice} = await inquirer.prompt([
            {
                type: "list",
                name: "choice",
                message: "What would you like to do next?",
                choices: ["View all employees", "View all roles", "View all departments", "Quit"]
            }
        ]);
        if(choice === "Quit") {
            break;
        } else if (choice === "View all employees") {
            let query = await db.query(
                'SELECT employee.id,\n' +
                '       employee.first_name,\n' +
                '       employee.last_name,\n' +
                '       role.title,\n' +
                '       department.department,\n' +
                '       role.salary,\n' +
                '       (SELECT CONCAT(first_name, " ", last_name)\n' +
                '        FROM employee AS manager\n' +
                '        where manager.id = employee.manager_id) as manager\n' +
                'FROM employee,\n' +
                '     role,\n' +
                '     department\n' +
                'WHERE employee.role_id = role.id\n' +
                '  AND role.department_id = department.id\n' +
                'ORDER BY role.id;'
            );
            console.log(cTable.getTable(query[0]));
        } else if (choice === "View all roles") {
            let query = await db.query(
                'SELECT role.id, role.title, department.department, role.salary\n' +
                'FROM role, department\n' +
                'WHERE role.department_id = department.id\n' +
                'ORDER BY role.id'
            );
            console.log(cTable.getTable(query[0]));

        } else if (choice === "View all departments") {
            let query = await db.query('SELECT * FROM department');
            console.log(cTable.getTable(query[0]));
        }
    }
    await db.end();
    //
    // const res = await axios.get(`https://manateejokesapi.herokuapp.com/manatees/random`);
    // const fileIRead = await read('log.json', 'utf-8');
    // console.log(fileIRead);
    // const jokeArr = JSON.parse(fileIRead);
    // const newItem = {
    //     user: ans.user,
    //     setup: res.data.setup,
    //     punchline: res.data.punchline
    // }
    // jokeArr.push(newItem);
    // console.log(jokeArr);
    // await write("log.json", JSON.stringify(jokeArr, null, 4))
    // console.log('done');
}
init();


