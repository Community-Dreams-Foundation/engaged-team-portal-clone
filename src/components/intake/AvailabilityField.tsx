
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { IntakeFormData } from "./types";
import { availabilityOptions } from "./constants";

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
          <FormLabel>Weekly Availability</FormLabel>
          <Select 
            onValueChange={(value) => field.onChange(Number(value))} 
            value={field.value?.toString()}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Select your availability" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {availabilityOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
