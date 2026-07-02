import { Input } from "@/components/ui/input"

interface Props {
  value: string
  onChange: (fullPhone: string) => void
  required?: boolean
  id?: string
}

// value/onChange work with the full "+91XXXXXXXXXX" string,
// but the visible input only shows/edits the 10-digit part.
export default function PhoneInput({ value, onChange, required, id }: Props) {
  const digits = value.startsWith("+91") ? value.slice(3) : value

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/\D/g, "").slice(0, 10)
    onChange(cleaned ? `+91${cleaned}` : "")
  }

  return (
    <div className="flex overflow-hidden rounded-md border border-input focus-within:ring-1 focus-within:ring-ring">
      <span className="flex items-center bg-muted px-3 text-sm text-muted-foreground">+91</span>
      <Input
        id={id}
        type="tel"
        inputMode="numeric"
        placeholder="9876543210"
        value={digits}
        onChange={handleChange}
        required={required}
        className="rounded-none border-0 focus-visible:ring-0"
      />
    </div>
  )
}