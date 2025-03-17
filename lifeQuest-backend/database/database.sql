DROP TABLE IF EXISTS LEADERBOARD;
DROP TABLE IF EXISTS ENTRY;
DROP TABLE IF EXISTS TODO;
DROP TABLE IF EXISTS STATUS;
DROP TABLE IF EXISTS QUEST;
DROP TABLE IF EXISTS USER;

CREATE TABLE USER (
                      userId INTEGER PRIMARY KEY AUTOINCREMENT,
                      email TEXT NOT NULL UNIQUE,
                      username TEXT NOT NULL UNIQUE,
                      password TEXT NOT NULL,
                      questId INTEGER ,
                      sex TEXT NOT NULL,
                      age INTEGER NOT NULL,
                      level INTEGER DEFAULT 1,
                      exp INTEGER DEFAULT 0,
                      rank INTEGER DEFAULT 0,
                      pfp_path TEXT,
                      FOREIGN KEY (questId) REFERENCES QUEST(questId) ON DELETE CASCADE
);

CREATE TABLE QUEST (
                       questId INTEGER PRIMARY KEY AUTOINCREMENT,
                       title TEXT NOT NULL,
                       expPoints INTEGER NOT NULL,
                       day DATE NOT NULL
);

CREATE TABLE STATUS (
                        statusId INTEGER PRIMARY KEY AUTOINCREMENT,
                        statusTitle TEXT NOT NULL UNIQUE
);

CREATE TABLE TODO (
                      todoId INTEGER PRIMARY KEY AUTOINCREMENT,
                      title TEXT NOT NULL,
                      deadline DATE NOT NULL,
                      userId INTEGER NOT NULL,
                      statusId INTEGER NOT NULL,
                      FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE,
                      FOREIGN KEY (statusId) REFERENCES Status(statusId) ON DELETE CASCADE
);


CREATE TABLE ENTRY (
                       entryId INTEGER PRIMARY KEY AUTOINCREMENT,
                       date DATE NOT NULL,
                       title TEXT NOT NULL,
                       duration INTEGER NOT NULL,
                       userId INTEGER NOT NULL,
                       FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE
);


CREATE TABLE LEADERBOARD (
                             id INTEGER PRIMARY KEY AUTOINCREMENT,
                             expGained INTEGER NOT NULL DEFAULT 0,
                             expLost INTEGER NOT NULL DEFAULT 0,
                             questsDone INTEGER NOT NULL DEFAULT 0,
                             userId INTEGER NOT NULL,
                             FOREIGN KEY (userId) REFERENCES User(userId) ON DELETE CASCADE
);

