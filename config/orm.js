var connection = require("./connection.js");

// Helper functions for SQL syntax, adds necessary number of '?' marks.
function printQuestionMarks(num) {
    var arr = [];

    for (var i = 0; i < num; i++) {
        arr.push("?");
    }

    return arr.toString();
}

//The object relational mapping functions
var orm = {
    // Selects everything in the department table
    selectDeptartments: function(cb) {
        var queryString = `SELECT dp.id, dp.dept_name, SUM(rl2.salary) as total_sal from department as dp
        LEFT JOIN role as rl
        ON rl.department_id = dp.id
        LEFT JOIN employee as em
        ON em.role_id = rl.id
        LEFT JOIN role as rl2 on
        rl2.id = em.role_id
        group by dp.id
        `;

    // var queryString = `SELECT dp.id, dp.dept_name, SUM(rl.salary) as total_sal FROM department as dp
    // LEFT JOIN role as rl 
    // ON dp.id = rl.department_id
    // LEFT JOIN employee as em
    // ON em.role_id = rl.id
    // GROUP By dp.id`;

    connection.query(queryString, function(err, result) {
        if (err) throw err;
        cb(result);
        });
    },

    //selects all employee data, joining the role and department tables
    selectEmployees: function(order, cb) {
    var queryString = `SELECT em.id, em.first_name, em.last_name, rl.title, dp.dept_name, 
        IFNULL(CONCAT(em2.first_name, ' ', em2.last_name),'-') as Manager, rl.salary 
        FROM employee as em
        LEFT JOIN role as rl
        ON em.role_id = rl.id
        LEFT JOIN department as dp
        ON rl.department_id = dp.id
        LEFT JOIN employee as em2
        ON em.manager_id = em2.id
        ORDER BY em.` + order ;
    connection.query(queryString, function(err, result) {
        if (err) throw err;
        cb(result);
        });
    },

    //selects all role data, joining the department table
    selectRoles: function(cb) {
    var queryString = `
        SELECT rl.id, rl.title, rl.salary, dp.dept_name FROM role as rl
        LEFT JOIN department as dp
        ON rl.department_id = dp.id`;
    connection.query(queryString, function(err, result) {
        if (err) throw err;
        cb(result);
        });
    },

    //get list of department names with IDs
    getDepartments: function(cb) {
        var queryString = "SELECT id, dept_name FROM department";
        var choiceArray = [];

        connection.query(queryString, function(err, result) {
            if (err) throw err;

            for (var i = 0; i < result.length; i++) {
                //create department object
                let department = {
                    name: result[i].dept_name,
                    value: result[i].id
                }
                choiceArray.push(department);
            }
            cb(choiceArray);
        });  
    },

    //get list of employee names with IDs
    getEmployees: function(cb) {
        var queryString = "SELECT id, first_name, last_name FROM employee";
        var choiceArray = [];
        
        connection.query(queryString, function(err, result) {
            if (err) throw err;

            for (var i = 0; i < result.length; i++) {

                let employee = {
                    name: result[i].first_name + " " + result[i].last_name,
                    value: result[i].id
                }
                choiceArray.push(employee);
            }
            cb(choiceArray);
        });  
    },

    // get list of roles with IDs
    getRoles: function(cb) {
        var queryString = "SELECT id, title FROM role";
        var choiceArray = [];

        connection.query(queryString, function(err, result) {
            if (err) throw err;

            for (var i = 0; i < result.length; i++) {
                //create role object
                let role = {
                    name: result[i].title,
                    value: result[i].id
                }
                choiceArray.push(role);
            }
            cb(choiceArray);
        });  
    },

    //get list of columns in a table other than the id column
    getColumns: function (table, cb){
        
        var queryString = `SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'company_DB' AND TABLE_NAME = '` ;

        queryString += table + "'";

        var choiceArray = [];

        connection.query(queryString, function(err, result) {
            if (err) throw err;
            //start at 1 since we don't need the ID column
            for (var i = 1; i < result.length; i++) {
                choiceArray.push(result[i].COLUMN_NAME);
            }
            cb(choiceArray);
        });
    },

    //updates an existing row for a given table and conditions
    update: function(table, objColVals, condition, cb) {
        var queryString = "UPDATE " + table;
    
        queryString += " SET ";
        queryString += objColVals;
        queryString += " WHERE ";
        queryString += condition;
    
        connection.query(queryString, function(err, result) {
            if (err) {
                throw err;
            }
    
            cb(result);
        });
    },

    //creates a new row in a given table with as many columns as provided
    create: function(table, cols, vals, cb) {
        var queryString = "INSERT INTO " + table;
    
        queryString += " (";
        queryString += cols.toString();
        queryString += ") ";
        queryString += "VALUES (";
        queryString += printQuestionMarks(vals.length);
        queryString += ") ";
    
        connection.query(queryString, vals, function(err, result) {
            if (err) {
                throw err;
            }
    
            cb(result);
        });
    },

    //deletes a row in a given table with a given id
    destroy: function(table, id, cb) {
        var queryString = "DELETE FROM " + table;
    
        queryString += " WHERE id = '";
        queryString += id + "'";

        connection.query(queryString, function(err, result) {
            if (err) {
                throw err;
            }
            cb(result);
        });
    },

    quit: function(){
        connection.end();
    }
};

module.exports = orm;