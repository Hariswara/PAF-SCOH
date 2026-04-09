export type ResourceType = 'LECTURE_HALL' | 'LAB' | 'MEETING_ROOM' | 'EQUIPMENT';
export type ResourceStatus = 'ACTIVE' | 'OUT_OF_SERVICE';

export interface ResourceDTO {
  name: string;
  type: ResourceType;
  capacity: number;
  location: string;
  availabilityWindows: string;
  status: ResourceStatus;
  description: string;
}

export interface ResourceResponse extends ResourceDTO {
  id: string;
  createdAt: string;
  updatedAt: string;
}