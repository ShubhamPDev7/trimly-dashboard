import { useEffect, useState } from "react"
import { useShopStore } from "@/store/shopStore"
import { useBarberProfile, useUpsertBarberProfile } from "@/hooks/useBarber"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ImageUpload from "@/components/shared/ImageUpload"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { toast } from "sonner"

interface Props {
  staffUserId: string | null
  staffName: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function BarberProfileDialog({ staffUserId, staffName, open, onOpenChange }: Props) {
  const shopId = useShopStore((s) => s.selectedShopId)
  
  // Fetch profile. If they don't have one, it will throw a 404 which react-query catches.
  const { data: profile, isLoading } = useBarberProfile(shopId, staffUserId)
  const upsertMutation = useUpsertBarberProfile(shopId, staffUserId)

  const [bio, setBio] = useState("")
  const [specialties, setSpecialties] = useState("")
  const [experience, setExperience] = useState("")
  const [instagram, setInstagram] = useState("")
  const [photoUrl, setPhotoUrl] = useState("")

  useEffect(() => {
    if (profile) {
      setBio(profile.bio ?? "")
      setSpecialties(profile.specialties ?? "")
      setExperience(profile.experienceYears != null ? String(profile.experienceYears) : "")
      setInstagram(profile.instagramHandle ?? "")
      setPhotoUrl(profile.photoUrl ?? "")
    } else {
      setBio("")
      setSpecialties("")
      setExperience("")
      setInstagram("")
      setPhotoUrl("")
    }
  }, [profile, open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await upsertMutation.mutateAsync({
        bio: bio || null,
        specialties: specialties || null,
        experienceYears: experience ? parseInt(experience, 10) : null,
        instagramHandle: instagram || null,
        photoUrl: photoUrl || null,
      })
      toast.success("Profile saved")
      onOpenChange(false)
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to save profile")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{staffName}'s Public Profile</DialogTitle>
        </DialogHeader>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading...</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Bio</Label>
              <Textarea 
                placeholder="Short bio about the barber..."
                value={bio} 
                onChange={(e) => setBio(e.target.value)} 
                rows={3} 
              />
            </div>
            <div className="space-y-2">
              <Label>Specialties</Label>
              <Input 
                placeholder="e.g. Fades, Beard Trims, Coloring"
                value={specialties} 
                onChange={(e) => setSpecialties(e.target.value)} 
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Experience (Years)</Label>
                <Input 
                  type="number" 
                  min="0"
                  value={experience} 
                  onChange={(e) => setExperience(e.target.value)} 
                />
              </div>
              <div className="space-y-2">
                <Label>Instagram Handle</Label>
                <Input 
                  placeholder="@username"
                  value={instagram} 
                  onChange={(e) => setInstagram(e.target.value)} 
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Profile Photo</Label>
              <ImageUpload
                folder="barber-profiles"
                value={photoUrl}
                onChange={(url) => setPhotoUrl(url)}
                onRemove={() => setPhotoUrl("")}
              />
            </div>
            <DialogFooter className="pt-2">
              <Button type="submit" disabled={upsertMutation.isPending} className="w-full">
                {upsertMutation.isPending ? "Saving..." : "Save Profile"}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}