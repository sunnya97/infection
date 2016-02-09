users = [];

// import user data from json file
d3.json("users.json", function(error, json) {
    if (error) {
        alert(error);
    }
    var dataset = json; // save this data to a variable


    // parse through json data to create new User objects and save to users array
    for (var i = 0; i < dataset.length; i++) {
        users.push(new User(String(dataset[i].userid)));
    }

    // parse through a second time to assign students to each User object
    // could not do the first time around because the User object for a student may not have been created
    for (var j = 0; j < dataset.length; j++) {
        var studentsToAdd = dataset[j].students.map(function(a) {
            return getUser(String(a));
        });

        getUser(dataset[j].userid).addStudents(studentsToAdd);

    }

    // parse through all the Users and finds the groups which are isolated portions of the graph
    var groups = [];
    var addedToGroup = [];

    for (var k = 0; k < users.length; k++) {
        var group = [];
        addToGroup(users[k]);

        function addToGroup(u) {
            if (!(addedToGroup.includes(u))) {
                group.push(u);
                addedToGroup.push(u);
                for (var l = 0; l < u.students.concat(u.coaches).length; l++) {
                    addToGroup(u.students.concat(u.coaches)[l]);
                }
            }

        }
        if (group.length > 0) {
            groups.push(group);
        }

    }




    // parse users to find the connections in order to create links to be inputted into D3
    links = [];
    for (var i = 0; i < users.length; i++) {
        links = links.concat(users[i].students.map(function(student) {
            return {
                "source": users[i],
                "target": student
            };
        }));
    }


    // a bunch of jquery stuff to make the page interactive
    $(document).ready(function() {
        // literally just to make the toggle look nice rather than just a plain checkbox
        $('#exactCheckbox').bootstrapToggle({
            on: 'Exact',
            off: 'Non-exact'
        });

        // Adds functionality to the first infect button
        $("#infectButton").click(function() {
            infect(getUser($("#infectTextbox").val()));
        });

        // adds functionality to second infect button.  Decides whether to use input as a proportion or a number.
        $("#limitedInfectButton").click(function() {
            if (parseFloat($("#limitedInfectTextbox").val()) < 1) {
                limitedInfect(parseFloat($("#limitedInfectTextbox").val()) * users.length)
            } else {
                limitedInfect(parseInt($("#limitedInfectTextbox").val()));
            }
        });

        // creates an alert that contains a list of the infected users.  errors if there are none.
        $("#alertList").click(function() {
            if (getInfected().length > 0) {
                swal("Infected Users:", getInfected().map(function(u) {
                    return u.id;
                }))
            } else {
                sweetAlert("Oops...", "There are no infected users!", "error");
            }
        });

        // resets all users to non-infected
        $("#resetButton").click(function() {
            resetAll();
        });

    });


    // sets width and height of d3 visualization
    var width = $("#visualization").width();
    var height = $(window).height() - $("#title-row").height();

    // sets parameters for the d3 force layout
    var force = d3.layout.force()
        .nodes(d3.values(users))
        .links(links)
        .size([width, height])
        .linkDistance(60)
        .charge(-300)
        .on("tick", tick)
        .start();

    // adds an svg to the visualization div
    var svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);

    // adds arrow heads to links
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])
        .enter()
        .append("svg:marker")
        .attr("id", function(d) {
            return d;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 6)
        .attr("markerHeight", 6)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");

    // adds the links between nodes
    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter()
        .append("svg:path")
        .attr("class", "link")
        .attr("marker-end", "url(#end)");

    // add the circular representation of the node
    // sets color to green or blue depending on whether its infected or not
    var circle = svg.append("g").selectAll("circle")
        .data(force.nodes())
        .enter().append("circle")
        .attr("r", 6)
        .style("fill", function(d) {
            if (d.infected) {
                return "green";
            } else {
                return "blue";
            }
        })
        .on("click", infect)
        .call(force.drag);

    // adds the User name next to its node
    var text = svg.append("g").selectAll("text")
        .data(force.nodes())
        .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) {
            return d.id;
        });

    // tick the visualization (d3 force is a dynamic time-based visualization).  essentially updates the graph.
    function tick() {
        path.attr("d", linkArc);
        circle.attr("transform", transform)
            .style("fill", function(d) {
                if (d.infected) {
                    return "green";
                } else {
                    return "blue";
                }
            });
        text.attr("transform", transform);


        $("#infectedCounter").text((getInfected().length));
    }

    // function for generating the link line
    function linkArc(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = 0; //Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }

    // translates a svg object by it's x and y coordinates
    function transform(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }

    // infects a passed user and then ticks the visualization as to update it
    // it then recursively infects all of its own students and coaches
    // there is a 1 second delay in order to visualize the infection spreading
    function infect(d) {
        d.infected = true;
        tick();
        setTimeout(function() {
            d.students.map(function(s) {
                if (!(s.infected)) {
                    infect(s);
                }
            });
        }, 1000);

        setTimeout(function() {
            d.coaches.map(function(s) {
                if (!(s.infected)) {
                    infect(s);
                }
            });
        }, 1000);
    }

    // infects as close to the amound passed number of users.
    // Calls the knapsack function in order to determine which users to infect without going over.
    // If the exact toggle is on, then it gives an error if it can't get the exact amount.
    function limitedInfect(num) {
        var groupsToInfect = knapsack(num);

        if (!($("#exactCheckbox").prop("checked")) || groupsToInfect.length == num) {
            for (var i = 0; i < groupsToInfect.length; i++) {
                for (var j = 0; j < groupsToInfect[i].length; j++) {
                    groupsToInfect[i][j].infected = true;
                }
            }
        } else {
            sweetAlert("Oops...", "There's no way to infect exactly that number of users.  Please choose a different number or turn off exact.", "error");
        }

        tick();
    }

    // sets all Users to uninfected
    function resetAll() {
        for (var i = 0; i < users.length; i++) {
            users[i].infected = false;
        }
        tick();
    }

    // knapsack problem to determine which groups to infect in order to get as close to the desried infected users
    // only uses unifected groups as to allow for extended infections.  For example, if originally 25% of users were infected
    // and you want to increase this to 50%, it is impractical to infect a new 50%, but rather would only infect an additional 25%
    function knapsack(capacity) {
        capacity -= (getInfected().length);

        console.log(capacity);

        available_groups = [];
        for (var i = 0; i < groups.length; i++) {
            if (groups[i].every(function(a) {
                    return a.infected == false;
                })) {
                available_groups.push({
                    groupnum: i,
                    weight: groups[i].length
                });
            }
        }

        weightMatrix = new Array(available_groups.length + 1);
        keepMatrix = new Array(available_groups.length + 1);
        solutionSet = [];


        for (var i = 0; i <= available_groups.length; i++) {
            weightMatrix[i] = new Array(capacity + 1);
            keepMatrix[i] = new Array(capacity + 1);
        }


        for (var i = 0; i <= available_groups.length; i++) {
            for (var j = 0; j <= capacity; j++) {

                if (i == 0 || j == 0) {
                    weightMatrix[i][j] = 0;
                } else if (available_groups[i - 1].weight <= j) {
                    newMax = available_groups[i - 1].weight + weightMatrix[i - 1][j - available_groups[i - 1].weight];
                    oldMax = weightMatrix[i - 1][j];

                    if (newMax > oldMax) {
                        weightMatrix[i][j] = newMax;
                        keepMatrix[i][j] = 1;
                    } else {
                        weightMatrix[i][j] = oldMax;
                        keepMatrix[i][j] = 0;
                    }
                } else {
                    weightMatrix[i][j] = weightMatrix[i - 1][j];
                }
            }
        }

        j = capacity
        for (var i = available_groups.length; i > 0; i--) {
            if (keepMatrix[i][j] === 1) {
                solutionSet.push(available_groups[i - 1]);
                j = j - available_groups[i - 1].weight;
            }
        }

        return solutionSet.map(function(g) {
            return groups[g.groupnum];
        });

    }

});


// constructor for new User object
function User(id) {
    this.id = id;
    this.students = [];
    this.coaches = [];
    this.infected = false;
}

// returns an array of all infected users
function getInfected() {
    infectedUsers = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].infected) {
            infectedUsers.push(users[i]);
        }
    }
    return infectedUsers;
}

// function to add Users to the students array of other users
User.prototype.addStudents = function(studentsToAdd) {
    this.students = this.students.concat(studentsToAdd);
    for (var i = 0; i < studentsToAdd.length; i++) {
        if (!(this.students[i].coaches.includes(this))) {
            this.students[i].coaches.push(this);
        }
    }
};

// function to add Users to the coaches array of other users
User.prototype.addCoaches = function(coachesToAdd) {
    this.coaches = this.coaches.concat(coachesToAdd);
    for (var i = 0; i < this.coaches.length; i++) {
        if (!(this.coaches[i].students.includes(this))) {
            this.coaches[i].students.push(this);
        }
    }
};

// returns the user Object based on their id
function getUser(getId) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == getId) {
            return users[i];
        }
    }
    return null;
}
