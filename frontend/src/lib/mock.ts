import type {
  Activity,
  ActivityEnrollments,
  ActivityType,
  AttendanceRecord,
  AuthUser,
  Certificate,
  Eligibility,
  EnrollmentSummary,
  HistoryItem,
  Location,
  OrganizerSummary,
  ReviewSummary,
  Session,
} from "./types";

// Datos temporales para el prototipo visual de la entrega D2.
// No consumen el backend: son solo de apoyo para mostrar las pantallas.

const ORGANIZER: OrganizerSummary = {
  id: 201,
  firstName: "Laura",
  lastName: "Mendoza",
  email: "organizador@icesi.edu.co",
  status: "ACTIVE",
};

export const mockStudent: AuthUser = {
  id: 101,
  firstName: "Ana",
  lastName: "Gómez",
  email: "ana.gomez@icesi.edu.co",
  role: "ESTUDIANTE",
};

export const mockOrganizer: AuthUser = {
  id: 201,
  firstName: "Laura",
  lastName: "Mendoza",
  email: "organizador@icesi.edu.co",
  role: "ORGANIZADOR",
};

// Actividades en las que el estudiante demo ya está inscrito (prototipo D2).
export const mockEnrolledIds = new Set([1, 3]);

export const mockActivityTypes: ActivityType[] = [
  { id: 1, name: "Deportiva", requiresEnrollment: true },
  { id: 2, name: "Cultural", requiresEnrollment: true },
  { id: 3, name: "Taller", requiresEnrollment: true },
  { id: 4, name: "Recreativa", requiresEnrollment: true },
];

export const mockLocations: Location[] = [
  { id: 1, name: "Cancha Sintética 1", building: "Zona Deportiva" },
  { id: 2, name: "Auditorio Varela", building: "Edificio Central" },
  { id: 3, name: "Sala de Talleres 204", building: "Edificio Sur" },
  { id: 4, name: "Zona Verde", building: "Campus Norte" },
  { id: 5, name: "Biblioteca Central", building: "Edificio Cultural" },
  { id: 6, name: "Coliseo Universitario", building: "Zona Deportiva" },
];

function findType(id: number | null): ActivityType | null {
  return mockActivityTypes.find((item) => item.id === id) ?? null;
}

function findLocation(id: number | null): Location | null {
  return mockLocations.find((item) => item.id === id) ?? null;
}

interface ActivitySeed {
  id: number;
  name: string;
  description: string;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  status: Activity["status"];
  registrationDeadline: string;
  isCertifiable: boolean;
  minAttendancePercentage?: number;
  imageUrl?: string | null;
  typeId: number | null;
  locationId: number | null;
  enrolledCount: number;
}

function buildActivity(seed: ActivitySeed): Activity {
  return {
    id: seed.id,
    name: seed.name,
    description: seed.description,
    date: seed.date,
    startTime: seed.startTime,
    endTime: seed.endTime,
    capacity: seed.capacity,
    status: seed.status,
    registrationDeadline: seed.registrationDeadline,
    isCertifiable: seed.isCertifiable,
    minAttendancePercentage: seed.minAttendancePercentage ?? 80,
    imageUrl: seed.imageUrl ?? null,
    activityType: findType(seed.typeId),
    location: findLocation(seed.locationId),
    organizer: ORGANIZER,
    createdAt: "2026-10-01T10:00:00.000Z",
    enrolledCount: seed.enrolledCount,
    availableSpots: Math.max(0, seed.capacity - seed.enrolledCount),
  };
}

export const mockActivities: Activity[] = [
  buildActivity({
    id: 1,
    name: "Torneo de fútbol 5",
    imageUrl: "https://picsum.photos/seed/kooler-futbol/400/300",
    description:
      "Torneo recreativo entre facultades donde podrás demostrar tu talento en la cancha. Forma tu equipo de cinco jugadores y participa por premios institucionales. Habrá árbitros, hidratación y zonas de descanso para todos los asistentes.",
    date: "2026-11-05",
    startTime: "14:00",
    endTime: "18:00",
    capacity: 20,
    status: "ACTIVE",
    registrationDeadline: "2026-11-03T23:59",
    isCertifiable: false,
    typeId: 1,
    locationId: 1,
    enrolledCount: 12,
  }),
  buildActivity({
    id: 2,
    name: "Concierto de la Banda Sinfónica",
    imageUrl: "https://picsum.photos/seed/kooler-concierto/400/300",
    description:
      "Presentación musical abierta a toda la comunidad universitaria en el auditorio principal. Disfruta de un repertorio que recorre desde clásicos hasta piezas contemporáneas. La entrada es libre y no requiere inscripción previa.",
    date: "2026-11-12",
    startTime: "18:30",
    endTime: "20:30",
    capacity: 100,
    status: "ACTIVE",
    registrationDeadline: "2026-11-10T23:59",
    isCertifiable: false,
    typeId: 2,
    locationId: 2,
    enrolledCount: 100,
  }),
  buildActivity({
    id: 3,
    name: "Taller de fotografía urbana",
    imageUrl: "https://picsum.photos/seed/kooler-foto/400/300",
    description:
      "Aprende composición, encuadre y edición básica recorriendo los rincones más fotogénicos del campus. Trae tu cámara o tu celular y practica junto a otros aficionados. Al final compartiremos las mejores tomas y daremos retroalimentación.",
    date: "2026-11-20",
    startTime: "09:00",
    endTime: "12:00",
    capacity: 15,
    status: "ACTIVE",
    registrationDeadline: "2026-11-18T23:59",
    isCertifiable: true,
    minAttendancePercentage: 80,
    typeId: 3,
    locationId: 3,
    enrolledCount: 5,
  }),
  buildActivity({
    id: 4,
    name: "Yoga al aire libre",
    imageUrl: "https://picsum.photos/seed/kooler-yoga/400/300",
    description:
      "Sesión guiada de yoga y respiración para cerrar la semana con energía renovada. Apta para principiantes y niveles intermedios, con ejercicios de estiramiento y relajación. Lleva ropa cómoda y una esterilla o toalla.",
    date: "2026-11-08",
    startTime: "07:00",
    endTime: "08:00",
    capacity: 25,
    status: "ACTIVE",
    registrationDeadline: "2026-11-07T23:59",
    isCertifiable: true,
    minAttendancePercentage: 80,
    typeId: 4,
    locationId: 4,
    enrolledCount: 10,
  }),
  buildActivity({
    id: 5,
    name: "Seminario de liderazgo estudiantil",
    imageUrl: "https://picsum.photos/seed/kooler-seminario/400/300",
    description:
      "Talleres de liderazgo, trabajo en equipo y comunicación para representantes estudiantiles. Aprenderás herramientas prácticas para gestionar proyectos y movilizar a tu comunidad. Incluye actividades dinámicas y un espacio de networking entre participantes.",
    date: "2026-10-02",
    startTime: "08:00",
    endTime: "12:00",
    capacity: 30,
    status: "FINISHED",
    registrationDeadline: "2026-09-30T23:59",
    isCertifiable: true,
    minAttendancePercentage: 80,
    typeId: 3,
    locationId: 2,
    enrolledCount: 30,
  }),
  buildActivity({
    id: 6,
    name: "Cine club: cine colombiano",
    imageUrl: "https://picsum.photos/seed/kooler-cine/400/300",
    description:
      "Proyección y conversatorio alrededor del cine colombiano contemporáneo. Veremos una selección de cortometrajes y hablaremos con invitados del sector audiovisual. Un espacio ideal para cinéfilos y curiosos.",
    date: "2026-10-25",
    startTime: "17:00",
    endTime: "19:30",
    capacity: 40,
    status: "CANCELLED",
    registrationDeadline: "2026-10-23T23:59",
    isCertifiable: false,
    typeId: 2,
    locationId: 5,
    enrolledCount: 18,
  }),
  buildActivity({
    id: 7,
    name: "Maratón de lectura",
    imageUrl: "https://picsum.photos/seed/kooler-lectura/400/300",
    description:
      "Jornada de lectura compartida y club de discusión sobre narrativa latinoamericana. Comparte tus libros favoritos, descubre nuevas lecturas y conversa con otros apasionados. Habrá recomendaciones y un espacio cómodo para leer en grupo.",
    date: "2026-09-15",
    startTime: "10:00",
    endTime: "13:00",
    capacity: 25,
    status: "FINISHED",
    registrationDeadline: "2026-09-13T23:59",
    isCertifiable: true,
    minAttendancePercentage: 80,
    typeId: 2,
    locationId: 5,
    enrolledCount: 25,
  }),
];

export function findActivity(id: number): Activity | undefined {
  return mockActivities.find((activity) => activity.id === id);
}

export const mockEnrollments: EnrollmentSummary[] = [
  {
    enrollmentId: 1,
    enrollmentDate: "2026-10-10",
    activity: {
      id: 1,
      name: "Torneo de fútbol 5",
      date: "2026-11-05",
      startTime: "14:00",
      endTime: "18:00",
      status: "ACTIVE",
      imageUrl: null,
      isCertifiable: false,
      category: "Deportiva",
      location: "Cancha Sintética 1",
    },
  },
  {
    enrollmentId: 2,
    enrollmentDate: "2026-10-12",
    activity: {
      id: 3,
      name: "Taller de fotografía urbana",
      date: "2026-11-20",
      startTime: "09:00",
      endTime: "12:00",
      status: "ACTIVE",
      imageUrl: null,
      isCertifiable: true,
      category: "Taller",
      location: "Sala de Talleres 204",
    },
  },
  {
    enrollmentId: 3,
    enrollmentDate: "2026-09-01",
    activity: {
      id: 5,
      name: "Seminario de liderazgo estudiantil",
      date: "2026-10-02",
      startTime: "08:00",
      endTime: "12:00",
      status: "FINISHED",
      imageUrl: null,
      isCertifiable: true,
      category: "Taller",
      location: "Auditorio Varela",
    },
  },
];

export const mockHistory: HistoryItem[] = [
  {
    activityId: 5,
    name: "Seminario de liderazgo estudiantil",
    date: "2026-10-02",
    attendance: "PRESENT",
    reviewed: false,
    myRating: null,
  },
  {
    activityId: 7,
    name: "Maratón de lectura",
    date: "2026-09-15",
    attendance: "PRESENT",
    reviewed: true,
    myRating: 5,
  },
];

export const mockCertificates: Certificate[] = [
  {
    id: 1,
    studentId: 101,
    activityId: 5,
    certificateCode: "KLR-2026-000123",
    issueDate: "2026-10-03",
  },
  {
    id: 2,
    studentId: 101,
    activityId: 7,
    certificateCode: "KLR-2026-000098",
    issueDate: "2026-09-16",
  },
];

export const mockEligibility: Record<number, Eligibility> = {
  3: {
    activityId: 3,
    sessionsTotal: 2,
    sessionsPresent: 0,
    attendancePercentage: 0,
    minimumAttendancePercentage: 80,
    eligible: false,
    reason: "ACTIVITY_NOT_FINISHED",
  },
  5: {
    activityId: 5,
    sessionsTotal: 2,
    sessionsPresent: 2,
    attendancePercentage: 100,
    minimumAttendancePercentage: 80,
    eligible: true,
  },
  7: {
    activityId: 7,
    sessionsTotal: 1,
    sessionsPresent: 1,
    attendancePercentage: 100,
    minimumAttendancePercentage: 80,
    eligible: true,
  },
};

export const mockSessions: Record<number, Session[]> = {
  3: [
    {
      id: 31,
      activityId: 3,
      sessionDate: "2026-11-20",
      startTime: "09:00",
      endTime: "10:30",
      createdAt: "2026-10-01T10:00:00.000Z",
    },
    {
      id: 32,
      activityId: 3,
      sessionDate: "2026-11-21",
      startTime: "09:00",
      endTime: "10:30",
      createdAt: "2026-10-01T10:00:00.000Z",
    },
  ],
  5: [
    {
      id: 51,
      activityId: 5,
      sessionDate: "2026-10-01",
      startTime: "08:00",
      endTime: "10:00",
      createdAt: "2026-10-01T10:00:00.000Z",
    },
    {
      id: 52,
      activityId: 5,
      sessionDate: "2026-10-02",
      startTime: "08:00",
      endTime: "12:00",
      createdAt: "2026-10-01T10:00:00.000Z",
    },
  ],
  7: [
    {
      id: 71,
      activityId: 7,
      sessionDate: "2026-09-15",
      startTime: "10:00",
      endTime: "13:00",
      createdAt: "2026-09-01T10:00:00.000Z",
    },
  ],
};

export const mockRoster: Record<number, ActivityEnrollments> = {
  5: {
    activityId: 5,
    activityName: "Seminario de liderazgo estudiantil",
    totalEnrolled: 4,
    capacity: 30,
    enrollments: [
      {
        enrollmentId: 51,
        enrollmentDate: "2026-09-01",
        student: {
          id: 101,
          firstName: "Ana",
          lastName: "Gómez",
          email: "ana.gomez@icesi.edu.co",
        },
      },
      {
        enrollmentId: 52,
        enrollmentDate: "2026-09-02",
        student: {
          id: 102,
          firstName: "Juan",
          lastName: "Pérez",
          email: "juan.perez@icesi.edu.co",
        },
      },
      {
        enrollmentId: 53,
        enrollmentDate: "2026-09-02",
        student: {
          id: 103,
          firstName: "María",
          lastName: "Rodríguez",
          email: "maria.rodriguez@icesi.edu.co",
        },
      },
      {
        enrollmentId: 54,
        enrollmentDate: "2026-09-03",
        student: {
          id: 104,
          firstName: "Carlos",
          lastName: "Ramírez",
          email: "carlos.ramirez@icesi.edu.co",
        },
      },
    ],
  },
  3: {
    activityId: 3,
    activityName: "Taller de fotografía urbana",
    totalEnrolled: 2,
    capacity: 15,
    enrollments: [
      {
        enrollmentId: 31,
        enrollmentDate: "2026-10-12",
        student: {
          id: 101,
          firstName: "Ana",
          lastName: "Gómez",
          email: "ana.gomez@icesi.edu.co",
        },
      },
      {
        enrollmentId: 32,
        enrollmentDate: "2026-10-13",
        student: {
          id: 105,
          firstName: "Luisa",
          lastName: "Torres",
          email: "luisa.torres@icesi.edu.co",
        },
      },
    ],
  },
};

export const mockAttendance: Record<string, AttendanceRecord[]> = {
  "5:51": [
    { studentId: 101, firstName: "Ana", lastName: "Gómez", status: "PRESENT", registrationDate: "2026-09-01" },
    { studentId: 102, firstName: "Juan", lastName: "Pérez", status: "PRESENT", registrationDate: "2026-09-02" },
    { studentId: 103, firstName: "María", lastName: "Rodríguez", status: "ABSENT", registrationDate: "2026-09-02" },
    { studentId: 104, firstName: "Carlos", lastName: "Ramírez", status: "PRESENT", registrationDate: "2026-09-03" },
  ],
  "5:52": [
    { studentId: 101, firstName: "Ana", lastName: "Gómez", status: "PRESENT", registrationDate: "2026-09-01" },
    { studentId: 102, firstName: "Juan", lastName: "Pérez", status: "PRESENT", registrationDate: "2026-09-02" },
    { studentId: 103, firstName: "María", lastName: "Rodríguez", status: "PRESENT", registrationDate: "2026-09-02" },
    { studentId: 104, firstName: "Carlos", lastName: "Ramírez", status: "PRESENT", registrationDate: "2026-09-03" },
  ],
};

export const mockActivityReviews: Record<number, ReviewSummary> = {
  1: {
    average: 4.5,
    total: 2,
    items: [
      {
        id: 11,
        rating: 5,
        comment: "Muy buen torneo, bien organizado y muy divertido.",
        date: "2026-11-06T16:20:00.000Z",
        author: "Juan P.",
      },
      {
        id: 12,
        rating: 4,
        comment: "Faltó hidratación, pero estuvo chévere.",
        date: "2026-11-06T18:05:00.000Z",
        author: "María R.",
      },
    ],
  },
  2: {
    average: 4.5,
    total: 2,
    items: [
      {
        id: 21,
        rating: 5,
        comment: "La banda estuvo espectacular.",
        date: "2026-11-12T20:40:00.000Z",
        author: "Carlos R.",
      },
      {
        id: 22,
        rating: 4,
        comment: "Buen sonido, aunque empezó unos minutos tarde.",
        date: "2026-11-12T21:10:00.000Z",
        author: "Ana G.",
      },
    ],
  },
  3: {
    average: 4.5,
    total: 2,
    items: [
      {
        id: 31,
        rating: 5,
        comment: "Aprendí muchísimo, muy práctico.",
        date: "2026-11-20T12:30:00.000Z",
        author: "Luisa T.",
      },
      {
        id: 32,
        rating: 4,
        comment: "Buen taller, aunque el recorrido fue corto.",
        date: "2026-11-20T13:00:00.000Z",
        author: "Juan P.",
      },
    ],
  },
  4: {
    average: 5,
    total: 2,
    items: [
      {
        id: 41,
        rating: 5,
        comment: "Relajante y muy bien guiado.",
        date: "2026-11-08T08:15:00.000Z",
        author: "Ana G.",
      },
      {
        id: 42,
        rating: 5,
        comment: "Excelente para empezar el día.",
        date: "2026-11-08T08:20:00.000Z",
        author: "María R.",
      },
    ],
  },
  5: {
    average: 4.5,
    total: 4,
    items: [
      {
        id: 1,
        rating: 5,
        comment: "Excelente taller, muy dinámico y bien organizado.",
        date: "2026-10-03T15:20:00.000Z",
        author: "Ana G.",
      },
      {
        id: 2,
        rating: 4,
        comment: "Buena experiencia, aunque faltó más tiempo para prácticas.",
        date: "2026-10-03T16:05:00.000Z",
        author: "Juan P.",
      },
      {
        id: 3,
        rating: 5,
        comment: "Los ponentes fueron muy claros. Lo recomiendo.",
        date: "2026-10-04T09:40:00.000Z",
        author: "María R.",
      },
      {
        id: 4,
        rating: 4,
        comment: null,
        date: "2026-10-04T11:15:00.000Z",
        author: "Carlos R.",
      },
    ],
  },
  6: {
    average: 3.5,
    total: 2,
    items: [
      {
        id: 61,
        rating: 4,
        comment: "Buena película y buen conversatorio.",
        date: "2026-10-25T19:40:00.000Z",
        author: "Carlos R.",
      },
      {
        id: 62,
        rating: 3,
        comment: "El lugar estaba muy lleno.",
        date: "2026-10-25T20:10:00.000Z",
        author: "Luisa T.",
      },
    ],
  },
  7: {
    average: 4.5,
    total: 2,
    items: [
      {
        id: 71,
        rating: 5,
        comment: "Muy enriquecedor, conocí buenos autores.",
        date: "2026-09-15T13:20:00.000Z",
        author: "Ana G.",
      },
      {
        id: 72,
        rating: 4,
        comment: "Faltaron más libros disponibles.",
        date: "2026-09-15T13:45:00.000Z",
        author: "Juan P.",
      },
    ],
  },
};
