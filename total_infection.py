class User:
    def __init__(self, entry, students=[], coaches=[]):
        self.userid = entry
        for coach in coaches:
            assert isinstance(coach, User)
        for student in students:
            assert isinstance(student, User)

        self.students = students
        self.coaches = coaches

        self.infected = True

    def addStudents(self, listStudents):
        self.students += listStudents
        for i in listStudents:
            if self not in i.coaches:
                i.addCoaches([self])

    def addCoaches(self, listCoaches):
        self.coaches += listCoaches
        for i in listCoaches:
            if self not in i.students:
                i.addStudents([self])

 
class UserGraph:
    def __init__(self, listUsers = {}):
        self.users = []
        
        for i in dictGraph:
            userList += [User(i)]

        for j in userList:
            j.addStudents(dictGraph[j.userid])



    def addUsers(listUsers):
        users += [listUsers]

    def getUser(idToGet):
        t = filter(lambda user: user.userid == idToGet, myList)
        if not t:
            return null
        else:
            return t[0]




def dictToUsers(d):
    


dictGraph = {'A': ['B', 'C'],
         'B': ['C', 'D'],
         'C': ['D'],
         'D': ['C'],
         'E': ['F'],
         'F': ['C']}

dictToUsers(dictGraph)


