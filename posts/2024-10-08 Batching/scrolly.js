// Initialize Scrollama
const scroller = scrollama();

// Define the steps and graphic elements
scroller
  .setup({
    step: '.step',
    offset: 0.5,
    debug: false,
  })
  .onStepEnter(response => {
    // Get the current step element
    const stepId = response.element.id;

    // Change visuals based on the step
    if (stepId === 'step1') {
      document.getElementById('image').src = 'image1.png';
    } else if (stepId === 'step2') {
      document.getElementById('image').src = 'image2.png';
    } else if (stepId === 'step3') {
      document.getElementById('image').src = 'image3.png';
    }
  });
