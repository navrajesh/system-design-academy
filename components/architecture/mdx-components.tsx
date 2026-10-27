import {
  ArchitectureDiagram,
  Callout,
  Calculation,
  Details,
} from "@/components/lesson-components";
import {
  ArchitectureWalkthrough,
  ExecutionTimeline,
  FailureScenario,
  InteractiveCalculation,
} from "@/components/learning-interactions";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { LessonCrossLink } from "@/components/architecture/lesson-cross-link";
import { TechnologyMatrix } from "@/components/architecture/technology-matrix";
import {
  ArchitectureAndDataFlow,
  FailureModes,
  LibraryBigPicture,
  LibraryInterviewTraps,
  LibraryMentalModel,
  LibraryUnderTheHood,
  SelectionCriteria,
} from "@/components/architecture/library-sections";

export const architectureMdxComponents = {
  LibraryBigPicture,
  LibraryUnderTheHood,
  ArchitectureAndDataFlow,
  SelectionCriteria,
  FailureModes,
  LibraryInterviewTraps,
  LibraryMentalModel,
  ArchitectureDiagram,
  MermaidDiagram,
  Callout,
  Calculation,
  Details,
  InteractiveCalculation,
  ExecutionTimeline,
  FailureScenario,
  ArchitectureWalkthrough,
  LessonCrossLink,
  TechnologyMatrix,
};
