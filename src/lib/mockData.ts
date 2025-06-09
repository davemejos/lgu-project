// Mock data for the LGU Project App

// User types
export interface User {
  id: number
  email: string
  name: string
  password: string
  phone?: string
  address?: string
  role: string
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'
  createdAt: string
  updatedAt: string
}

// Personnel types
export interface Personnel {
  id: number
  name: string
  email: string
  phone?: string
  address?: string
  profilePhoto?: string
  department: string
  position?: string
  hireDate?: string
  status: 'Active' | 'Inactive' | 'On Leave' | 'Suspended'
  biography?: string
  spouseName?: string
  spouseOccupation?: string
  childrenCount?: string
  emergencyContact?: string
  childrenNames?: string
  createdAt: string
  updatedAt: string
  documents?: PersonnelDocument[]
}

// Document types
export interface PersonnelDocument {
  id: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  path: string
  personnelId: number
  createdAt: string
  updatedAt: string
}

// Mock Users Data - Using pre-computed hashes to avoid sync operations at module load
export const mockUsers: User[] = [
  {
    id: 1,
    email: 'demo@admin.com',
    name: 'Demo Admin',
    password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5uO9G', // demo123
    phone: '+63 912 345 6789',
    address: 'Ipil, Zamboanga Sibugay',
    role: 'admin',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    email: 'admin@example.com',
    name: 'Administrator',
    password: '$2a$12$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // admin123
    phone: '+63 912 345 6790',
    address: 'Ipil, Zamboanga Sibugay',
    role: 'admin',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 3,
    email: 'user@fisheries.gov',
    name: 'Regular User',
    password: '$2a$12$TwQsp4j5ikeiUux2BdQoTO.4y/Lfbg4qxQq3fLdHpyD/2s2YGFqtG', // user123
    phone: '+63 912 345 6791',
    address: 'Ipil, Zamboanga Sibugay',
    role: 'user',
    status: 'ACTIVE',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

// Mock Personnel Data
export const mockPersonnel: Personnel[] = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john.doe@fisheries.gov',
    phone: '+63 912 345 6789',
    address: 'Ipil, Zamboanga Sibugay',
    profilePhoto: '/images/profiles/john-doe.jpg',
    department: 'Fisheries Management',
    position: 'Senior Fisheries Officer',
    hireDate: '2020-01-15',
    status: 'Active',
    biography: 'Experienced fisheries officer with over 10 years in marine resource management.',
    spouseName: 'Jane Doe',
    spouseOccupation: 'Teacher',
    childrenCount: '2',
    emergencyContact: '+63 912 345 6790',
    childrenNames: 'Alice Doe, Bob Doe',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    documents: []
  },
  {
    id: 2,
    name: 'Maria Santos',
    email: 'maria.santos@fisheries.gov',
    phone: '+63 912 345 6791',
    address: 'Ipil, Zamboanga Sibugay',
    profilePhoto: '/images/profiles/maria-santos.jpg',
    department: 'Aquaculture Development',
    position: 'Aquaculture Specialist',
    hireDate: '2019-03-20',
    status: 'Active',
    biography: 'Specialist in sustainable aquaculture practices and fish farming techniques.',
    spouseName: 'Carlos Santos',
    spouseOccupation: 'Engineer',
    childrenCount: '1',
    emergencyContact: '+63 912 345 6792',
    childrenNames: 'Miguel Santos',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    documents: []
  },
  {
    id: 3,
    name: 'Roberto Cruz',
    email: 'roberto.cruz@fisheries.gov',
    phone: '+63 912 345 6793',
    address: 'Ipil, Zamboanga Sibugay',
    profilePhoto: '/images/profiles/roberto-cruz.jpg',
    department: 'Marine Resources',
    position: 'Marine Biologist',
    hireDate: '2021-06-10',
    status: 'Active',
    biography: 'Marine biologist specializing in coral reef conservation and marine biodiversity.',
    spouseName: 'Ana Cruz',
    spouseOccupation: 'Nurse',
    childrenCount: '3',
    emergencyContact: '+63 912 345 6794',
    childrenNames: 'Pedro Cruz, Sofia Cruz, Luis Cruz',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    documents: []
  },
  {
    id: 4,
    name: 'Elena Rodriguez',
    email: 'elena.rodriguez@fisheries.gov',
    phone: '+63 912 345 6795',
    address: 'Ipil, Zamboanga Sibugay',
    profilePhoto: '/images/profiles/elena-rodriguez.jpg',
    department: 'Fish Processing',
    position: 'Processing Supervisor',
    hireDate: '2018-09-05',
    status: 'Active',
    biography: 'Expert in fish processing techniques and quality control standards.',
    spouseName: 'Manuel Rodriguez',
    spouseOccupation: 'Fisherman',
    childrenCount: '2',
    emergencyContact: '+63 912 345 6796',
    childrenNames: 'Carmen Rodriguez, Diego Rodriguez',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    documents: []
  },
  {
    id: 5,
    name: 'Antonio Mendoza',
    email: 'antonio.mendoza@fisheries.gov',
    phone: '+63 912 345 6797',
    address: 'Ipil, Zamboanga Sibugay',
    profilePhoto: '/images/profiles/antonio-mendoza.jpg',
    department: 'Extension Services',
    position: 'Extension Officer',
    hireDate: '2022-02-14',
    status: 'Active',
    biography: 'Community outreach specialist working with local fishing communities.',
    spouseName: 'Rosa Mendoza',
    spouseOccupation: 'Social Worker',
    childrenCount: '1',
    emergencyContact: '+63 912 345 6798',
    childrenNames: 'Isabella Mendoza',
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z',
    documents: []
  }
]

// Mock Documents Data
export const mockDocuments: PersonnelDocument[] = [
  {
    id: 1,
    filename: 'certificate_john_doe.pdf',
    originalName: 'Fisheries Certificate - John Doe.pdf',
    mimeType: 'application/pdf',
    size: 1024000,
    path: '/documents/certificate_john_doe.pdf',
    personnelId: 1,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: 2,
    filename: 'license_maria_santos.pdf',
    originalName: 'Aquaculture License - Maria Santos.pdf',
    mimeType: 'application/pdf',
    size: 856000,
    path: '/documents/license_maria_santos.pdf',
    personnelId: 2,
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-01T00:00:00.000Z'
  }
]

// Utility functions for mock data operations
export class MockDatabase {
  private static users = [...mockUsers]
  private static personnel = [...mockPersonnel]
  private static documents = [...mockDocuments]

  // User operations
  static async findUserByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null
  }

  static async findUserById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null
  }

  static async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    const newUser: User = {
      ...userData,
      id: Math.max(...this.users.map(u => u.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.users.push(newUser)
    return newUser
  }

  static async updateUser(id: number, userData: Partial<User>): Promise<User | null> {
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex === -1) return null
    
    this.users[userIndex] = {
      ...this.users[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    }
    return this.users[userIndex]
  }

  static async deleteUser(id: number): Promise<boolean> {
    const userIndex = this.users.findIndex(user => user.id === id)
    if (userIndex === -1) return false
    
    this.users.splice(userIndex, 1)
    return true
  }

  static async getAllUsers(): Promise<User[]> {
    return [...this.users]
  }

  // Personnel operations
  static async findPersonnelByEmail(email: string): Promise<Personnel | null> {
    return this.personnel.find(person => person.email === email) || null
  }

  static async findPersonnelById(id: number): Promise<Personnel | null> {
    return this.personnel.find(person => person.id === id) || null
  }

  static async createPersonnel(personnelData: Omit<Personnel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Personnel> {
    const newPersonnel: Personnel = {
      ...personnelData,
      id: Math.max(...this.personnel.map(p => p.id)) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.personnel.push(newPersonnel)
    return newPersonnel
  }

  static async updatePersonnel(id: number, personnelData: Partial<Personnel>): Promise<Personnel | null> {
    const personnelIndex = this.personnel.findIndex(person => person.id === id)
    if (personnelIndex === -1) return null
    
    this.personnel[personnelIndex] = {
      ...this.personnel[personnelIndex],
      ...personnelData,
      updatedAt: new Date().toISOString()
    }
    return this.personnel[personnelIndex]
  }

  static async deletePersonnel(id: number): Promise<boolean> {
    const personnelIndex = this.personnel.findIndex(person => person.id === id)
    if (personnelIndex === -1) return false
    
    this.personnel.splice(personnelIndex, 1)
    return true
  }

  static async getAllPersonnel(page: number = 1, limit: number = 10): Promise<{
    data: Personnel[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }> {
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const data = this.personnel.slice(startIndex, endIndex)
    
    return {
      data,
      pagination: {
        page,
        limit,
        total: this.personnel.length,
        pages: Math.ceil(this.personnel.length / limit)
      }
    }
  }
}
