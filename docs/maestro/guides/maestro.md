# Maestro: Specs-Driven Development

## 1. Overview

**Maestro** is a powerful, integrated **Specs-Driven Development (SDD)** framework within Claude-Flow. It transforms high-level requirements into structured, executable specifications and coordinates multi-agent workflows to automate the software development lifecycle.

The framework is built on a foundation of **collective intelligence**, leveraging a **hive-mind** of specialized AI agents to handle tasks such as requirements analysis, technical design, implementation, and quality assurance.

### Core Principles

*   **Specification-First:** Every feature begins with a clear, version-controlled specification.
*   **Multi-Agent Coordination:** Specialized agents collaborate on complex development tasks.
*   **Human-in-the-Loop:** Approval gates ensure user control and oversight at critical phases.
*   **Living Documentation:** Specifications and code are kept in sync automatically.
*   **Continuous Quality:** Automated quality checks and consensus-based reviews are integrated throughout the workflow.

## 2. The Maestro Workflow

Maestro guides features through a structured, phase-based lifecycle. Each phase has a specific goal and is typically managed by a specialized agent.

### Phase 1: Requirements Clarification

*   **Goal:** Transform a high-level request into a structured, testable requirements document.
*   **Process:** The `requirements-engineer` agent generates a `requirements.md` file, often using formats like EARS notation and user stories.
*   **Gate:** User must approve the requirements before proceeding.

### Phase 2: Research & Design

*   **Goal:** Create a comprehensive technical design based on the approved requirements.
*   **Process:** The `design-architect` agent, often in collaboration with other specialized agents (e.g., `security-specialist`), generates a `design.md` file. This includes system architecture, data models, API specifications, and more.
*   **Gate:** The design is validated through a **hive consensus** process and requires user approval.

### Phase 3: Implementation Planning

*   **Goal:** Break down the technical design into a detailed, actionable implementation plan.
*   **Process:** The `task-planner` agent generates a `tasks.md` file, which is a checklist of sequential development tasks.
*   **Gate:** User must approve the implementation plan.

### Phase 4: Task Execution

*   **Goal:** Implement the feature by completing the tasks defined in the plan.
*   **Process:** The `developer` agent executes each task, modifying the codebase, running tests, and updating documentation.
*   **Gate:** User reviews and approves the implementation of each task.

## 3. Getting Started

### Installation & Initialization

To get started with Maestro, ensure you have the latest version of `claude-flow` installed.

First, initialize the **steering documents** for your project. This is a one-time setup that provides essential context to the AI agents.

```bash
npx claude-flow maestro init-steering
```

This command creates a `.claude/claude-flow/maestro/steering/` directory with the following files:

*   `product.md`: For product vision, user roles, and business objectives.
*   `tech.md`: For technology stack, frameworks, and architectural constraints.
*   `structure.md`: For code organization, naming conventions, and file structures.

You can also create custom steering documents for specific domains (e.g., `api-design.md`).

### A Full Feature Workflow Example

Here’s how to develop a new feature from start to finish with Maestro:

1.  **Create the Specification:**
    *   Start by creating a new specification for your feature.

    ```bash
    npx claude-flow maestro create-spec user-authentication --request "Implement OAuth2 login"
    ```

    *   This creates a `requirements.md` file. Review and refine it as needed.

2.  **Generate the Design:**
    *   Once the requirements are ready, generate the technical design.

    ```bash
    npx claude-flow maestro generate-design user-authentication
    ```

    *   This will trigger the `design-architect` agent and, if enabled, a hive consensus validation. After the design is generated, approve it to proceed.

    ```bash
    npx claude-flow maestro approve-phase user-authentication
    ```

3.  **Plan the Implementation:**
    *   Generate the task breakdown from the approved design.

    ```bash
    npx claude-flow maestro generate-tasks user-authentication
    ```

    *   Review the `tasks.md` file and, when ready, approve the plan.

    ```bash
    npx claude-flow maestro approve-phase user-authentication
    ```

4.  **Implement the Tasks:**
    *   Execute each task sequentially.

    ```bash
    npx claude-flow maestro implement-task user-authentication 1
    npx claude-flow maestro implement-task user-authentication 2
    # ...and so on
    ```

5.  **Check Status:**
    *   At any point, you can check the status of your feature workflow.

    ```bash
    npx claude-flow maestro status user-authentication
    ```

## 4. Advanced Features

Maestro includes a suite of advanced, "Kiro-enhanced" features that can be enabled for a more intelligent and automated development process.

### Hive Consensus

*   **What it is:** A system for multi-agent validation of development artifacts. Instead of a single agent making a decision, a "swarm" of agents reviews the artifact (e.g., a design document), and a decision is made based on their collective consensus.
*   **Benefits:** Improves the quality and reliability of AI-generated content, and provides a mechanism for automated, fault-tolerant decision-making.
*   **How to use:** Enabled by default when the hive-mind integration is active. The `generate-design` command will automatically use it.

### Living Documentation

*   **What it is:** A real-time, bidirectional synchronization system that keeps your specifications (`.md` files) and your code (`.ts`, `.js` files) in sync.
*   **Benefits:** Prevents documentation from becoming outdated and ensures that the implementation always reflects the specification.
*   **How to use:** Can be enabled via configuration. Once enabled, it works in the background, monitoring for changes.

### Agent Hooks

*   **What it is:** An event-driven automation system that allows you to trigger actions based on events in your development workflow (e.g., file changes, git commits, failed tests).
*   **Benefits:** Enables powerful automations, such as running a quality check agent every time a file is saved, or triggering a security scan on every commit.
*   **How to use:** Hooks can be configured in your project to automate a wide range of tasks.

### Pattern Learning

*   **What it is:** A system that learns from your past development activities to provide intelligent suggestions and improve the quality of AI-generated content over time.
*   **Benefits:** Helps to enforce best practices, reuse common solutions, and improve the efficiency of the development process.
*   **How to use:** Works in the background, analyzing successful (and unsuccessful) development workflows to identify patterns.

For more detailed information on the architecture and implementation of these features, see the [Maestro Internals](./maestro-internals.md) documentation.
