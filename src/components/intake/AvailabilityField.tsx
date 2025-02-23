
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { UseFormReturn } from "react-hook-form";
import { IntakeFormData } from "./types";

interface AvailabilityFieldProps {
  form: UseFormReturn<IntakeFormData>;
}

export function AvailabilityField({ form }: AvailabilityFieldProps) {
  return (
    <FormField
      control={form.control}
      name="availability"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Total Hours of Availability per Week</FormLabel>
          <FormControl>
            <Input
              type="number"
              min={1}
              max={168}
              {...field}
              onChange={(e) => field.onChange(Number(e.target.value))}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
