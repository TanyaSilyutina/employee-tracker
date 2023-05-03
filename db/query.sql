USE tracker_db;

SELECT * FROM department;
SELECT * FROM role;
SELECT * FROM employee;

# -- SELECT movies.movie_name AS movie, reviews.review as review FROM movies LEFT JOIN reviews ON reviews.movie_id = movies.id;
#
# -- INSERT INTO movies (movie_name) VALUES ("Memento");
#
# UPDATE reviews SET review = "BAAAAAAAAAD MOVIE" WHERE movie_id = 1;
#
# SELECT * FROM reviews;