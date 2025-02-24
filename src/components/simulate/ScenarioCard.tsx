
import { Button } from "@/components/ui/button";

interface ScenarioCardProps {
  title: string;
  description: string;
  onStart: () => void;
  disabled?: boolean;
  isInProgress?: boolean;
  children?: React.ReactNode;
}

export const ScenarioCard = ({
  title,
  description,
  onStart,
  disabled = false,
  isInProgress = false,
  children,
}: ScenarioCardProps) => {
  return (
    <div className="bg-muted/50 p-4 rounded-md">
      <h3 className="font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {children || (
        <Button
          variant="secondary"
          className="w-full"
          onClick={onStart}
          disabled={disabled}
        >
          {isInProgress ? "In Progress" : "Start Scenario"}
        </Button>
      )}
    </div>
  );
};
