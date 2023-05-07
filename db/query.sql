USE tracker_db;

SELECT *
FROM department;

# SELECT role.id, role.title, department.department, role.salary
# FROM role, department
# WHERE role.department_id = department.id
# ORDER BY role.id


INSERT INTO department (department) VALUES ("Service");

