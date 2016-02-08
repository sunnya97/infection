users = [];


d3.json("users.json", function(error, json) {
    if (error) {
        alert(error);
    }
    var dataset = json;

    //console.log(JSON.stringify(dataset));

    for (var i = 0; i < dataset.length; i++) {
        users.push(new User(String(dataset[i].userid)));
    }

    for (var j = 0; j < dataset.length; j++) {
        var studentsToAdd = dataset[j].students.map(function(a) {
            return getUser(String(a));
        });

        getUser(dataset[j].userid).addStudents(studentsToAdd);

    }

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





    links = [];
    for (var i = 0; i < users.length; i++) {
        links = links.concat(users[i].students.map(function(student) {
            return {
                "source": users[i],
                "target": student
            };
        }));
    }

    $(document).ready(function() {
        $("#infectButton").click(function() {
            infect(getUser($("#infectTextbox").val()));
        });

        $("#resetButton").click(function() {
            resetAll();
        });

    });



    var width = $("#visualization").width();
    var height = width;


    var force = d3.layout.force()
        .nodes(d3.values(users))
        .links(links)
        .size([width, height])
        .linkDistance(60)
        .charge(-300)
        .on("tick", tick)
        .start();

    var svg = d3.select("#visualization").append("svg")
        .attr("width", width)
        .attr("height", height);


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

    var path = svg.append("svg:g").selectAll("path")
        .data(force.links())
        .enter()
        .append("svg:path")
        .attr("class", "link")
        .attr("marker-end", "url(#end)");


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

    var text = svg.append("g").selectAll("text")
        .data(force.nodes())
        .enter().append("text")
        .attr("x", 8)
        .attr("y", ".31em")
        .text(function(d) {
            return d.id;
        });

    // Use elliptical arc path segments to doubly-encode directionality.
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

    function linkArc(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = 0; //Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }

    function transform(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }

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


    function resetAll() {
        for (var i = 0; i < users.length; i++) {
            users[i].infected = false;
        }
        tick();
    }
});



function User(id) {
    this.id = id;
    this.students = [];
    this.coaches = [];
    this.infected = false;
}

function getInfected() {
    infectedUsers = [];
    for (var i = 0; i < users.length; i++) {
        if (users[i].infected) {
            infectedUsers.push(users[i]);
        }
    }
    return infectedUsers;
}

User.prototype.addStudents = function(studentsToAdd) {
    this.students = this.students.concat(studentsToAdd);
    for (var i = 0; i < studentsToAdd.length; i++) {
        if (!(this.students[i].coaches.includes(this))) {
            this.students[i].coaches.push(this);
        }
    }
};
User.prototype.addCoaches = function(coachesToAdd) {
    this.coaches = this.coaches.concat(coachesToAdd);
    for (var i = 0; i < this.coaches.length; i++) {
        if (!(this.coaches[i].students.includes(this))) {
            this.coaches[i].students.push(this);
        }
    }
};


function getUser(getId) {
    for (var i = 0; i < users.length; i++) {
        if (users[i].id == getId) {
            return users[i];
        }
    }
    return null;
}
