## Purpose

Gives support managers a single read-only view of ticket demand, priority and category distribution, and support agent workload so operational decisions do not require manually counting list rows.

## ADDED Requirements

### Requirement: Dashboard loading and failure states

The Dashboard SHALL load support cases and support agents through the existing mock data API and SHALL NOT display metrics until both datasets are available.

#### Scenario: Data loads successfully
- **WHEN** a user opens the Dashboard and both datasets load
- **THEN** the system displays the ticket, category, and agent workload panels with the loaded data

#### Scenario: Data is loading
- **WHEN** the Dashboard is opened and either dataset is still loading
- **THEN** the system displays a loading indicator and no partial metrics

#### Scenario: Data fails to load
- **WHEN** either dataset request fails
- **THEN** the system displays an error message and no metrics

### Requirement: Ticket status and unassigned summary

The Dashboard SHALL display the total number of tickets, the number of tickets in each status (open, in-progress, closed), and the number of tickets that have no assigned agent. All counts SHALL cover every status unless a panel is explicitly described as open-only.

#### Scenario: Totals reflect all tickets
- **WHEN** the ticket dataset contains open, in-progress, and closed tickets
- **THEN** the displayed total equals the sum of the per-status counts and includes closed tickets

#### Scenario: Unassigned count
- **WHEN** tickets exist with no assigned agent
- **THEN** the unassigned total equals the number of those tickets across all statuses

### Requirement: Priority overview

The Dashboard SHALL display the number of tickets for each priority level (low, medium, high, critical) across all statuses, and SHALL highlight the combined high and critical count together with how many of those are open.

#### Scenario: Priority counts
- **WHEN** the ticket dataset contains tickets at multiple priority levels
- **THEN** each priority shows its count and the priority counts sum to the total ticket count

#### Scenario: Open high and critical work
- **WHEN** high or critical tickets have status open
- **THEN** the highlighted high and critical total includes all high and critical tickets and shows the open subset separately

### Requirement: Open tickets by category

The Dashboard SHALL show the number of open tickets for every ticket category, ordered from most to least open tickets.

#### Scenario: Category ranking
- **WHEN** open tickets exist across billing, technical, and account categories
- **THEN** each category is listed with its open ticket count, highest first, and ties keep a stable order

#### Scenario: Category with no open tickets
- **WHEN** a category has zero open tickets
- **THEN** the category is still listed with a count of zero

### Requirement: Agent workload classification

The Dashboard SHALL derive each agent's workload from the number of assigned tickets with status open or in-progress. Closed tickets SHALL NOT count toward workload. Each agent SHALL be classified as available (0-2 active tickets), busy (3-5 active tickets), or overloaded (6 or more active tickets). The Dashboard SHALL show a count of agents in each class and list every agent with their active ticket count, classification, and specialty, ordered from highest to lowest workload.

#### Scenario: Available agent
- **WHEN** an agent has at most two assigned open or in-progress tickets
- **THEN** the agent is listed as available

#### Scenario: Busy agent
- **WHEN** an agent has three to five assigned open or in-progress tickets
- **THEN** the agent is listed as busy

#### Scenario: Overloaded agent
- **WHEN** an agent has six or more assigned open or in-progress tickets
- **THEN** the agent is listed as overloaded

#### Scenario: Closed tickets do not add workload
- **WHEN** an agent has closed tickets in addition to active tickets
- **THEN** the workload count and classification consider only the open and in-progress tickets

#### Scenario: Agent with no active tickets
- **WHEN** an agent has no assigned open or in-progress tickets
- **THEN** the agent appears in the workload list with a count of zero and an available classification

### Requirement: Read-only and accessible presentation

The Dashboard SHALL present operations information without allowing ticket or agent changes from the Dashboard, and SHALL convey classification and priority through text labels as well as color.

#### Scenario: No mutation controls
- **WHEN** a user views the Dashboard
- **THEN** no control assigns, edits, or closes a ticket, or changes an agent

#### Scenario: Non-color status communication
- **WHEN** a workload classification or priority is displayed with a colored indicator
- **THEN** the same information is also available as text
