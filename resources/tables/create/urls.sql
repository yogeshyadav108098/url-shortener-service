CREATE TABLE urls
(
    id bigint(20) unsigned NOT NULL AUTO_INCREMENT,
    url text,
    status tinyint(3),
    createdAt timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='Urls info';


