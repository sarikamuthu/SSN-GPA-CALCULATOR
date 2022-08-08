var app = angular.module("app", []);

angular.element(function () {
    $(".tabs").tabs();
    $("select").formSelect();
    $(".loader").delay(500).fadeOut();
    $(".sidenav").sidenav();
    $(".modal").modal();
    $(".tooltipped").tooltip();
    $('.collapsible').collapsible();

});

app.run(function ($rootScope) {
    $rootScope.courseTitle = courseName;
});


app.controller("gpaCtrl", function ($scope) {
    $scope.grades = gradeValues;
    $scope.subjects = courseUnits;
    $scope.savedSubjects = localStorage.getItem("subjects");

    $scope.reset = function reset() {
        localStorage.removeItem("subjects");
        window.location.reload();
    };


    function calGPA(sumOfGPA, sumOfCredits) {
        return sumOfCredits > 0 ? sumOfGPA / sumOfCredits : 0;
    }


    $scope.updateGPA = function updateGPA() {
    

        let myResults = [];
        let mySubjects = 0,
            totalNumOfSubjects = 0;
        let myTotalGPA = 0,
            myTotalCredit = 0,
            totalCourseCredit = 0;

        for (i = 0; i < $scope.subjects.length; i++) {
            let currentYear = $scope.subjects[i],
                yearGPA = 0,
                yearCredit = 0;

            for (k = 0; k < currentYear.sems.length; k++) {
                let semester = $scope.subjects[i].sems[k];

                let semesterGPA = 0,
                    semesterCredit = 0,
                    totalSemesterCredit = 0;

                for (j = 0; j < semester.subs.length; j++) {
                    let currentSubject = semester.subs[j];
                    let subjectCredit = 1 * currentSubject.c;

                    totalNumOfSubjects += 1;

                    if (currentSubject.grade != null && currentSubject.grade != undefined) {
                        myResults.push({
                            year: parseInt(i + 1),
                            grade: currentSubject.grade,
                            credit: parseInt(currentSubject.c),
                        });
                        mySubjects += 1;

                        let subjectGPA = currentSubject.grade * currentSubject.c;

                        semesterGPA += subjectGPA;
                        yearGPA += subjectGPA;
                        myTotalGPA += subjectGPA;

                        semesterCredit += subjectCredit;
                        yearCredit += subjectCredit;
                        myTotalCredit += subjectCredit;
                    }

                    totalCourseCredit += subjectCredit;
                    totalSemesterCredit += subjectCredit;
                }

                semester.semesterCredit = semesterCredit;
                semester.totalSemesterCredit = totalSemesterCredit;
                semester.semesterGPA = calGPA(semesterGPA, semesterCredit);
            }

            currentYear.yearGPA = yearGPA / yearCredit;
            currentYear.yearCredit = yearCredit;

            
        }

        $scope.results = myResults.reduce(
            (acc, e) =>
                acc.set(e.grade, {
                    count: (acc.get(e.grade) ? acc.get(e.grade).count + 1 : 1),
                    credits: (acc.get(e.grade) ? acc.get(e.grade).credits + e.credit : e.credit)
                }),
            new Map()
        );

        $scope.mySubjects = mySubjects;
        $scope.totalNumOfSubjects = totalNumOfSubjects;
        $scope.myTotalCredit = myTotalCredit;
        $scope.totalCourseCredit = totalCourseCredit;
        $scope.myGPA = calGPA(myTotalGPA, myTotalCredit);

        const { greetingsMsg, eligibilityMsg, style } = findEligibility(
            $scope.myGPA
        );

        $scope.greetingsText = greetingsMsg;
        $scope.eligibilityText = eligibilityMsg;
        $scope.eligibleStyle = style;

        localStorage.setItem("subjects", angular.toJson($scope.subjects));
        localStorage.setItem("myGPA", angular.toJson($scope.myGPA));
    };

    if ($scope.savedSubjects != undefined) {
        $scope.loadSubjects = JSON.parse($scope.savedSubjects);

        try {
            for (i = 0; i < $scope.subjects.length; i++) {
                let year = $scope.subjects[i];
                for (k = 0; k < year.sems.length; k++) {
                    let sem = $scope.subjects[i].sems[k];
                    for (j = 0; j < sem.subs.length; j++) {
                        sem.subs[j].grade = $scope.loadSubjects[i].sems[k].subs[j].grade;
                    }
                }
            }
            $scope.updateGPA();
        } catch (err) {
            $scope.reset();
            console.log("resetting...\n" + err);
        }
    }
});
