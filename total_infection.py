class User:
    def __init__(self, entry, students=[], coaches=[]):
        self.userid = userid
        for coach in coaches:
            assert isinstance(coach, User)
        for student in students:
            assert isinstance(student, User)

        self.students = students
        self.coaches = coaches

        self.infected = False

    def addStudents(listStudents):
        self.students += listStudents
        for i in listStudents:
            if self not in i.coaches:
                i.addCoaches([self])

    def addCoaches(listCoaches):
        self.coaches += listCoaches
            for i in listCoaches:
                if self not in i.students:
                    i.addStudents([self])

 
class UserGraph:
    users = []
    def __init__(self, listUsers):
        for i in dictGraph:
            users += [i]




def dictToUsers(d):
    
    for i in dictGraph:



dictGraph = {'A': ['B', 'C'],
         'B': ['C', 'D'],
         'C': ['D'],
         'D': ['C'],
         'E': ['F'],
         'F': ['C']}

UserGraph(dictGraph)


