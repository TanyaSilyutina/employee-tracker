USE tracker_db;

SELECT *
FROM employee;

# SELECT role.id, role.title, department.department, role.salary
# FROM role, department
# WHERE role.department_id = department.id
# ORDER BY role.id

SELECT employee.id,
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
ORDER BY role.id;