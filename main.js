users = []

d3.json("users.json", function(error, json) {
    if (error) {
        alert(error);
    }
    var dataset = json;

    console.log(JSON.stringify(dataset));

    for (var i = 0; i < dataset.length; i++) {
        users.push(new User(dataset[i].userid));
    }

    for (var j = 0; j < dataset.length; j++) {
        var studentsToAdd = dataset[j].students.map(function(a) {
            return getUser(a);
        });

        getUser(dataset[j].userid).addStudents(studentsToAdd);

    }

    generateDirectedGraph(users);

});


function generateDirectedGraph() {
    /*var nodes = users.map(function(user){
        return user.id;
    });*/

    links = [];
    for (var i = 0; i < users.length; i++) {
        links = links.concat(users[i].students.map(function(student) {
            return {
                "source": users[i],
                "target": student
            };
        }));
    }


    var width = 960;
    var height = 500;

    var svg = d3.select("#here").append("svg")
        .attr("width", width)
        .attr("height", height);

    var force = d3.layout.force()
        .nodes(d3.values(users))
        .links(links)
        .size([width, height])
        .linkDistance(60)
        .charge(-300)
        .on("tick", tick)
        .start();


    var link = svg.selectAll("line")
    .data(data.links)
    .enter.append("line")
    .attr("class", "link")
    .style("stroke", "#ccc");

    var node = svg.selectAll(".node")
    .data(data.nodes)
    .enter().append("g")
    .call(force.drag);

    svg.append("svg:defs").selectAll("marker")
        .data(["end"])
        .enter()
        .append("svg:marker")
        .attr("id", String)
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

    var node = svg.selectAll(".node")
        .data(force.nodes())
        .enter().append("g")
        .attr("class", "node")
        .call(force.drag);


    node.append("circle")
        .attr("r", 5);

    node.append("text")
        .attr("x", 12)
        .attr("dy", ".35em")
        .text(function(d) {
            return d.id;
        });

    // add the curvy lines
    function tick() {
        path.attr("d", function(d) {
            var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy);
            return "M" +
                d.source.x + "," +
                d.source.y + "A" +
                dr + "," + dr + " 0 0,1 " +
                d.target.x + "," +
                d.target.y;
        });

        node
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }
}




getUser("A")

function User(id) {
    this.id = id;
    this.students = [];
    this.coaches = [];
    this.infected = false;
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
