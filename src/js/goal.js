let goal; //the variable to store the object label as goal

//method to create the object of goal
const createGoalObject = () => {
    goal = Bodies.rectangle(
        width - (unitLengthX / 2), //calculating center x-point of the goal so it will be at bottom
        height - (unitLengthY / 2), //calculating center y-point of the goal so it will be at bottom
        unitLengthX * 0.6, //width of the goal block
        unitLengthY * 0.6, //height of the goal block
        {
            isStatic: true, //making it static so gravity doesn't effect it
            label: 'goal', //labeling it as a goal
            render: {
                fillStyle: 'green' //giving it a color
            }
        }
    );
}