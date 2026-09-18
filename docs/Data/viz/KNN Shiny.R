# Load necessary libraries
library(shiny)
library(shinydashboard)
library(ggplot2)
library(class)
library(plotly)
library(dplyr)
library(DT)
library(shinythemes)
library(shinycssloaders)
library(shinyBS)  # For tooltips

# Define UI
ui <- dashboardPage(
  skin = "blue",
  dashboardHeader(title = "Interactive KNN Classification"),

  dashboardSidebar(
    sidebarMenu(
      menuItem("Controls", tabName = "controls", icon = icon("sliders"))
    ),
    h4("Adjust Parameters"),
    selectInput("xcol", "X Variable", choices = names(iris)[1:4], selected = "Sepal.Length"),
    selectInput("ycol", "Y Variable", choices = names(iris)[1:4], selected = "Sepal.Width"),
    selectInput("zcol", "Z Variable (for 3D plot)", choices = c("None", names(iris)[1:4]), selected = "None"),
    sliderInput("k", "Number of Neighbors (k)", min = 1, max = 20, value = 5),
    sliderInput("trainSplit", "Training Set Proportion (%)", min = 50, max = 90, value = 70),
    # Add tooltip to the checkbox using bsTooltip
    div(
      checkboxInput("standardize", "Standardize Variables", value = FALSE),
      bsTooltip("standardize", "Standardization scales variables to have a mean of zero and a standard deviation of one. This is important in KNN because it ensures that all variables contribute equally to the distance calculations.",
                placement = "right", options = list(container = "body"))
    )
  ),

  dashboardBody(
    # Custom CSS
    tags$head(
      tags$style(HTML("
        /* Adjust font sizes */
        body {
          font-size: 16px;
        }
        /* Adjust box titles */
        .box-title {
          font-weight: bold;
          font-size: 18px;
        }
        /* Footer styling */
        .main-footer {
          padding: 10px;
          text-align: center;
          background: #f9f9f9;
          position: fixed;
          bottom: 0;
          width: 100%;
        }
      "))
    ),

    tabItems(
      tabItem(tabName = "controls",
              fluidRow(
                box(
                  title = "Introduction",
                  status = "primary",
                  solidHeader = TRUE,
                  width = 12,
                  collapsible = TRUE,
                  p("Welcome to this interactive app designed to help you understand the K-Nearest Neighbors (KNN) classification algorithm using the Iris dataset."),
                  p("**How KNN Works:**"),
                  p("K-Nearest Neighbors (KNN) is a simple, instance-based learning algorithm used for classification and regression. In classification, it works by identifying the k closest training examples (neighbors) to a new, unseen data point, and assigning the class label that is most frequent among those neighbors."),
                  p("The steps of the KNN algorithm are:"),
                  tags$ol(
                    tags$li("Choose the number of neighbors k."),
                    tags$li("Calculate the distance between the new data point and all training data points."),
                    tags$li("Select the k nearest neighbors based on the calculated distances."),
                    tags$li("Assign the class label that is most common among the k neighbors.")
                  ),
                  p("**Why KNN?**"),
                  p("KNN is intuitive and easy to implement, making it a good starting point for classification tasks. It is especially useful when the decision boundary is irregular and cannot be easily defined by parametric models.")
                )
              ),
              # Arrange the Data Summary and Accuracy Metrics side by side
              fluidRow(
                box(
                  title = "Dataset Summary",
                  status = "primary",
                  solidHeader = TRUE,
                  width = 6,  # Half of the row width
                  collapsible = TRUE,
                  DTOutput("dataSummary") %>% withSpinner(color = "#3c8dbc")
                ),
                box(
                  title = "Accuracy Metrics",
                  status = "primary",
                  solidHeader = TRUE,
                  width = 6,  # Half of the row width
                  collapsible = TRUE,
                  plotOutput("confusionMatrixPlot", height = "300px"),
                  verbatimTextOutput("accuracy")
                )
              ),
              # Arrange the Data Visualization and Decision Boundaries side by side
              fluidRow(
                box(
                  title = "Data Visualization",
                  status = "primary",
                  solidHeader = TRUE,
                  width = 6,  # Half of the row width
                  collapsible = TRUE,
                  p("This plot displays all the data points from the Iris dataset. Training data is shown with lighter colors and circle markers, while test data points are darker with diamond markers. Species are indicated by different colors."),
                  plotlyOutput("dataPlot", height = "400px") %>% withSpinner(color = "#3c8dbc")
                ),
                box(
                  title = "Decision Boundaries",
                  status = "primary",
                  solidHeader = TRUE,
                  width = 6,  # Half of the row width
                  collapsible = TRUE,
                  p("The plot shows the decision boundaries created by the KNN algorithm based on the training data. Only the test data points are displayed to illustrate how the model predicts unseen data."),
                  uiOutput("decisionBoundaryUI")
                )
              )
      )
    ),

    # Footer
    tags$footer(
      tags$hr(),
      p("Created by ", tags$a(href = "https://jacobjameson.com", "Jacob Jameson"), align = "center"),
      style = "background-color: #f9f9f9; padding: 10px;")
  )
)

# Define server logic
server <- function(input, output, session) {

  # Reactive expression to get the selected data
  selectedData <- reactive({
    req(input$xcol, input$ycol)
    if (input$zcol == "None") {
      data <- iris[, c(input$xcol, input$ycol, "Species")]
      if (input$standardize) {
        data[, 1:2] <- scale(data[, 1:2])
      }
    } else {
      data <- iris[, c(input$xcol, input$ycol, input$zcol, "Species")]
      if (input$standardize) {
        data[, 1:3] <- scale(data[, 1:3])
      }
    }
    data
  })

  # Dataset summary
  output$dataSummary <- renderDT({
    summaryData <- selectedData()
    datatable(summaryData, options = list(pageLength = 5))
  })

  # Split data into training and testing sets
  trainIndex <- reactive({
    set.seed(513)
    sample(1:nrow(selectedData()), (input$trainSplit / 100) * nrow(selectedData()))
  })

  trainingData <- reactive({
    selectedData()[trainIndex(), ]
  })

  testingData <- reactive({
    selectedData()[-trainIndex(), ]
  })

  # KNN model
  knnModel <- reactive({
    if (input$zcol == "None") {
      knn(
        train = trainingData()[, 1:2],
        test = testingData()[, 1:2],
        cl = trainingData()[, "Species"],
        k = input$k
      )
    } else {
      knn(
        train = trainingData()[, 1:3],
        test = testingData()[, 1:3],
        cl = trainingData()[, "Species"],
        k = input$k
      )
    }
  })

  # Confusion Matrix
  confusionMatrix <- reactive({
    predicted <- knnModel()
    actual <- testingData()[, "Species"]
    table(Predicted = predicted, Actual = actual)
  })

  # Prettify Confusion Matrix Plot
  output$confusionMatrixPlot <- renderPlot({
    cm_df <- as.data.frame(confusionMatrix())
    names(cm_df) <- c("Predicted", "Actual", "Freq")
    ggplot(data = cm_df, aes(x = Actual, y = Predicted, fill = Freq)) +
      geom_tile() +
      geom_text(aes(label = Freq), color = "white", size = 6) +
      scale_fill_gradient(low = "lightblue", high = "blue") +
      labs(title = "Confusion Matrix", x = "Actual", y = "Predicted") +
      theme_minimal(base_size = 15) +
      theme(legend.position = "none",
            plot.title = element_text(hjust = 0.5))
  })

  # Accuracy Metrics
  output$accuracy <- renderPrint({
    cm <- confusionMatrix()
    accuracy <- sum(diag(cm)) / sum(cm)
    cat(sprintf("Accuracy: %.2f%%", accuracy * 100))
  })

  # Data Visualization Plot (All Data Points)
  output$dataPlot <- renderPlotly({
    plotData <- selectedData()
    plotData$Set <- ifelse(rownames(plotData) %in% rownames(testingData()), "Test", "Train")
    if (input$zcol == "None") {
      # 2D Plot
      p <- ggplot() +
        geom_point(data = plotData[plotData$Set == "Train", ],
                   aes_string(x = input$xcol, y = input$ycol, color = "Species"),
                   size = 3, alpha = 0.3, shape = 16) +
        geom_point(data = plotData[plotData$Set == "Test", ],
                   aes_string(x = input$xcol, y = input$ycol, color = "Species"),
                   size = 3, alpha = 1.0, shape = 17) +
        labs(title = "Iris Dataset Visualization",
             x = input$xcol,
             y = input$ycol,
             color = "Species") +
        theme_minimal(base_size = 15) +
        theme(legend.position = "right",
              plot.title = element_text(hjust = 0.5))
      ggplotly(p)
    } else {
      # 3D Plot
      plot_ly() %>%
        add_markers(
          data = plotData[plotData$Set == "Train", ],
          x = ~get(input$xcol),
          y = ~get(input$ycol),
          z = ~get(input$zcol),
          color = ~Species,
          colors = c("setosa" = "red", "versicolor" = "blue", "virginica" = "green"),
          marker = list(size = 4, symbol = "circle", opacity = 0.3),
          showlegend = TRUE,
          name = "Training Data"
        ) %>%
        add_markers(
          data = plotData[plotData$Set == "Test", ],
          x = ~get(input$xcol),
          y = ~get(input$ycol),
          z = ~get(input$zcol),
          color = ~Species,
          colors = c("setosa" = "red", "versicolor" = "blue", "virginica" = "green"),
          marker = list(size = 6, symbol = "diamond", opacity = 1.0),
          showlegend = TRUE,
          name = "Test Data"
        ) %>%
        layout(title = "Iris Dataset Visualization",
               scene = list(
                 xaxis = list(title = input$xcol),
                 yaxis = list(title = input$ycol),
                 zaxis = list(title = input$zcol)
               ))
    }
  })

  # Decision Boundary Plot
  output$decisionBoundaryUI <- renderUI({
    if (input$zcol == "None") {
      plotOutput("decisionBoundary2D", height = "400px")
    } else {
      plotlyOutput("decisionBoundary3D", height = "400px")
    }
  })

  # 2D Decision Boundary Plot
  output$decisionBoundary2D <- renderPlot({
    # Create a grid of points
    x_min <- min(selectedData()[, 1]) - 0.5
    x_max <- max(selectedData()[, 1]) + 0.5
    y_min <- min(selectedData()[, 2]) - 0.5
    y_max <- max(selectedData()[, 2]) + 0.5

    x_seq <- seq(x_min, x_max, length.out = 200)
    y_seq <- seq(y_min, y_max, length.out = 200)
    grid <- expand.grid(x_seq, y_seq)
    names(grid) <- c(input$xcol, input$ycol)

    # Predict classes for each point in the grid
    gridPredictions <- knn(
      train = trainingData()[, 1:2],
      test = grid,
      cl = trainingData()[, "Species"],
      k = input$k
    )

    grid$Predicted <- gridPredictions

    # Plot decision boundaries with test data only
    testData <- testingData()
    testData$Predicted <- knnModel()

    ggplot() +
      geom_tile(data = grid, aes_string(x = input$xcol, y = input$ycol, fill = "Predicted"), alpha = 0.5) +
      geom_point(data = testData, aes_string(x = input$xcol, y = input$ycol, color = "Species"), size = 3, shape = 17) +
      scale_fill_manual(values = c('setosa' = 'pink', 'versicolor' = 'lightblue', 'virginica' = 'lightgreen')) +
      scale_color_manual(values = c('setosa' = 'red', 'versicolor' = 'blue', 'virginica' = 'green')) +
      labs(title = "Decision Boundaries (2D)",
           x = input$xcol,
           y = input$ycol,
           fill = "Predicted",
           color = "Actual Species") +
      theme_minimal(base_size = 15) +
      theme(legend.position = "right",
            plot.title = element_text(hjust = 0.5))
  })

  # 3D Decision Boundary Plot
  output$decisionBoundary3D <- renderPlotly({
    # Create grid for decision boundary
    x_seq <- seq(min(selectedData()[, 1]), max(selectedData()[, 1]), length.out = 30)
    y_seq <- seq(min(selectedData()[, 2]), max(selectedData()[, 2]), length.out = 30)
    z_seq <- seq(min(selectedData()[, 3]), max(selectedData()[, 3]), length.out = 30)
    grid3d <- expand.grid(x_seq, y_seq, z_seq)
    colnames(grid3d) <- c(input$xcol, input$ycol, input$zcol)

    # Predict classes for each point in the grid
    gridPredictions <- knn(
      train = trainingData()[, 1:3],
      test = grid3d,
      cl = trainingData()[, "Species"],
      k = input$k
    )

    grid3d$Predicted <- gridPredictions

    # Sample grid points to improve performance
    set.seed(123)
    sampledGrid <- grid3d[sample(1:nrow(grid3d), size = 1000), ]

    testData <- testingData()
    testData$Predicted <- knnModel()

    plot_ly() %>%
      add_markers(
        data = sampledGrid,
        x = ~get(input$xcol),
        y = ~get(input$ycol),
        z = ~get(input$zcol),
        color = ~Predicted,
        colors = c("setosa" = 'pink', "versicolor" = 'lightblue', "virginica" = 'lightgreen'),
        marker = list(size = 2),
        opacity = 0.4,
        showlegend = FALSE
      ) %>%
      add_markers(
        data = testData,
        x = ~get(input$xcol),
        y = ~get(input$ycol),
        z = ~get(input$zcol),
        color = ~Species,
        colors = c("setosa" = 'red', "versicolor" = 'blue', "virginica" = 'green'),
        marker = list(size = 6, symbol = "diamond"),
        opacity = 1.0,
        name = "Test Data"
      ) %>%
      layout(title = "3D Decision Boundaries",
             scene = list(
               xaxis = list(title = input$xcol),
               yaxis = list(title = input$ycol),
               zaxis = list(title = input$zcol)
             ))
  })
}

# Run the application
shinyApp(ui = ui, server = server)
