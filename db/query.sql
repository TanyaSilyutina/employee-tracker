USE tracker_db;


# SELECT * FROM employee;

SELECT role.id, role.title, department.department, role.salary
FROM role, department
WHERE role.department_id = department.id
ORDER BY role.id
#
# -- INSERT INTO movies (movie_name) VALUES ("Memento");
#
# UPDATE reviews SET review = "BAAAAAAAAAD MOVIE" WHERE movie_id = 1;
#
# SELECT * FROM reviews;

