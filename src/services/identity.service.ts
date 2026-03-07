import { PrismaClient } from "@prisma/client"
import {Contact} from "@prisma/client"

const prisma = new PrismaClient()

interface IdentityServiceInput {
  email: string
  phoneNumber: string
}

const identityService = async ({ email, phoneNumber }: IdentityServiceInput) => {

  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email },
        { phoneNumber }
      ]
    }
  })

  if (contacts.length === 0) {

    const primaryContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkedId: null,
        linkPrecedence: "primary"
      }
    })

    return {
      contact: {
        primaryContactId: primaryContact.id,
        emails: [primaryContact.email],
        phoneNumbers: [primaryContact.phoneNumber],
        secondaryContactIds: []
      }
    }
  }

  let primaryContact: Contact | null | undefined = contacts.find(c => c.linkPrecedence === "primary")!

  if (!primaryContact) {
    const primaryId = contacts[0].linkedId

    primaryContact = await prisma.contact.findUnique({
      where: { id: primaryId! }
    })
  }

  const linkedId = primaryContact!.id

  let linkedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: linkedId },
        { linkedId: linkedId }
      ]
    }
  })

  const emailSet = new Set<string>()
  const phoneSet = new Set<string>()
  const secondarySet = new Set<number>()

  for (const contact of linkedContacts) {

    if (contact.email) {
      emailSet.add(contact.email)
    }

    if (contact.phoneNumber) {
      phoneSet.add(contact.phoneNumber)
    }

    if (contact.linkPrecedence === "secondary") {
      secondarySet.add(contact.id)
    }

  }

  const emails = Array.from(emailSet)
  const phoneNumbers = Array.from(phoneSet)
  const secondaryContactIds = Array.from(secondarySet)

  const emailExists = emails.includes(email)
  const phoneExists = phoneNumbers.includes(phoneNumber)

  if (emailExists && phoneExists) {

    return {
        primaryContactId: primaryContact!.id,
        emails,
        phoneNumbers,
        secondaryContactIds
    }

  }

  await prisma.contact.create({
    data: {
      email,
      phoneNumber,
      linkedId: primaryContact!.id,
      linkPrecedence: "secondary"
    }
  })

    linkedContacts = await prisma.contact.findMany({
    where: {
        OR: [
        { id: primaryContact!.id },        // The Primary record itself
        { linkedId: primaryContact!.id }   // All records linked TO this Primary
        ]
    },
    orderBy: {
        createdAt: 'asc' // Ensures the oldest is at the start of your arrays
    }
    });

  const updatedEmailSet = new Set<string>()
  const updatedPhoneSet = new Set<string>()
  const updatedSecondarySet = new Set<number>()

  for (const contact of linkedContacts) {

    if (contact.email) {
      updatedEmailSet.add(contact.email)
    }

    if (contact.phoneNumber) {
      updatedPhoneSet.add(contact.phoneNumber)
    }

    if (contact.linkPrecedence === "secondary") {
      updatedSecondarySet.add(contact.id)
    }

  }

  return {
      primaryContactId: primaryContact!.id,
      emails: Array.from(updatedEmailSet),
      phoneNumbers: Array.from(updatedPhoneSet),
      secondaryContactIds: Array.from(updatedSecondarySet)
  }

}

export { identityService }