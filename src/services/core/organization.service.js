const path = require('path');
const fs = require('fs');
const httpStatus = require('http-status');
const models = require('../../models/core');
const Organizations = models.organizations;
const OrganizationDocs = models.organizationDocs;
const Users = models.users;
const organizationApps = models.organizationApps;
const ApiError = require('../../utils/ApiError');
const { Op } = require('sequelize'); 
const userService = require('./user.service');
const mailSender = require('./mailSender');
const config = require('../../config/core/config');
const { getTenantDbInstance } = require('../../models/tenant');
const moveFile = require('../../utils/moveFile');
const { HttpStatusCode } = require('axios');
const {
  buildSearchCondition
} = require('../../utils/queryUtils');

// const fs = require('fs').promises;
// const path = require('path');

/**
 * Retrieves a list of organizations.
 * @returns {Promise<Array>} A promise that resolves to an array of organizations.
 */
const list = async () => {
  const organizations = await Organizations.findAll();
  return organizations;
};

/**
 * Creates a new organization with the given information.
 *
 * @param {string} name - The name of the organization.
 * @param {string} email - The email address of the organization.
 * @param {string} phone - The phone number of the organization.
 * @param {string} address - The address of the organization.
 * @param {string} website - The website of the organization.
 * @param {Array} documents - An array of documents associated with the organization.
 * @param {string} primaryuser - The primary user of the organization in JSON format.
 * @returns {Object} - The created organization object.
 */
const create = async (name, email, phone, address, website, documents, primaryuser) => {
  await checkUniqueOrganization(email, phone);
  const db_name = '';
  const organization = await Organizations.create({ db_name, name, email, phone, address, website, is_active: false });
  let primaryUser;
  if (organization) {
    const orgId = organization.id;
    const primary_user = JSON.parse(primaryuser);
    primary_user.organization_id = orgId;
    primary_user.is_primary = true;
    primary_user.is_active = true;
    primary_user.status = true;
    primaryUser = await userService.createUser(primary_user);

    if (primaryUser) {
      try {
        const param = { name, email, phone }; // PASSING DUMMY VALUES BECAUSE IT WONT ACCEPT NULL
        const response = await mailSender.sendEmail({
          senderEmail: process.env.EMAIL_FROM,
          senderName: process.env.EMAIL_FROM_NAME,
          recipientName: primaryUser.name,
          recipientEmail: primaryUser.email,
          subject: 'Welcome',
          htmlContent: '<p>.</p>', // IF TEMPLATE ID IS PASSING THEN HTML CONTENT IS set to <p>.</p> , else can use custom html loaded from DIR
          templateId: 1,
          params: param,
        });
      } catch (error) {
        console.log(error);
      }
    }
    if (documents) {
      for (let i = 0; i < documents.length; i++) {
        await createDocument(
          orgId,
          documents[i].title,
          documents[i].description,
          documents[i].file_name,
          documents[i].disk_name,
          documents[i].expiry_date
        );
      }
    }
  }



  return { organization, user: primaryUser };
};

/**
 * Creates a new document for an organization.
 * @param {string} organization_id - The ID of the organization.
 * @param {string} title - The title of the document.
 * @param {string} description - The demoveFilescription of the document.
 * @param {string} file_name - The name of the file associated with the document.
 * @param {string} disk_name - The name of the disk where the file is stored.
 * @param {Date} expiry_date - The expiry date of the document.
 * @returns {Promise<Object>} - A promise that resolves to the created document.
 */
const createDocument = async (organization_id, title, description, file_name, disk_name, expiry_date, file_type, file_size) => {

  moveFile('../../temp/', '../../uploads/organization/docs', disk_name);
  const docs = await OrganizationDocs.create({ organization_id, title, description, file_name, disk_name, expiry_date, file_type, file_size });
  return docs;
};


/**
 * Retrieves information about an organization and its associated documents and users.
 * @param {number} orgId - The ID of the organization to retrieve information for.
 * @returns {Promise<Object|null>} - A promise that resolves to an object containing the organization data and its associated documents and users, or null if the organization is not found.
 */
const showOne = async (orgId) => {
  const organization = await Organizations.findOne({
    where: { id: orgId },
    include: [
      {
        model: OrganizationDocs,
        as: 'documents',
        attributes: ['title', 'description', 'file_name', 'disk_name', 'expiry_date', 'createdAt', 'id', 'file_type', 'file_size'],
      },
      {
        model: Users,
        as: 'users',
        attributes: [
          'is_primary',
          'first_name',
          'last_name',
          'email',
          'role',
          'status',
          'updatedAt',
          'createdAt',
          'id',
          'organization_id',
        ],
      },
      {
        model: organizationApps,
        as: 'connected_apps',
        attributes: ['id', 'app_id', 'createdAt', 'updatedAt'],
      },
    ],
  });

  if (organization) {
    const orgData = organization.toJSON();
    orgData.documents = orgData.documents.map((doc) => ({
      ...doc,
      file_name: `/${doc.disk_name}/${doc.file_name}`,
      // file_name: `${doc.disk_name}/${doc.file_name}`.replace(/\\/g, '/')
    }));
    return orgData;
  }
  return null;
};

/**
 * Drops an organization from the database.
 *
 * @param {number} orgId - The ID of the organization to be dropped.
 * @returns {Promise<number>} - The number of rows affected by the deletion.
 * @throws {ApiError} - If the organization does not exist or if the deletion fails.
 */
const drop = async (orgId) => {
  const isExist = await showOne(orgId);
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Organization not found !');
  }
  const is_deleted = await Organizations.destroy({ where: { id: orgId } });
  if (is_deleted) {
    return is_deleted;
  } else {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Not Deleted !');
  }
};

const edit = async (orgId, body) => {
  const isExist = await showOne(orgId);
  if (!isExist) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Organization not found !');
  }
  const is_updated = await Organizations.update(body, { where: { id: orgId } });
  if (is_updated) {
    const updatedOrganizationDetails = await showOne(orgId);
    return updatedOrganizationDetails;
  } else {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Not Updated !');
  }
};

/**
 * Retrieves a single user for a specific organization.
 * @param {string} organization_id - The ID of the organization.
 * @param {string} id - The ID of the user.
 * @returns {Promise<Object>} - A promise that resolves to the user object.
 */
const getOneUserForOrganization = async (organization_id, id) => {
  const user = await userService.getOneUserForOrganization(organization_id, id);
  return user;
};

/**
 * Retrieves all users for a given organization.
 * @param {string} organization_id - The ID of the organization.
 * @returns {Promise<Array>} - A promise that resolves to an array of user objects.
 */
const getAllUserForOrganization = async (organization_id, user_id = null) => {
  const users = await userService.getAllUserForOrganization(organization_id, user_id);
  return users;
};

/**
 * Checks if the email or phone number already exists in the Organizations collection.
 * Throws an error if the email or phone number is already in use.
 *
 * @param {string} email - The email to check.
 * @param {string} phone - The phone number to check.
 * @throws {ApiError} If the email or phone number is already in use.
 */
const checkUniqueOrganization = async (email, phone) => {
  if (email) {
    const emailExists = await Organizations.findOne({ where: { email } });
    if (emailExists) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Email already in use');
    }
  }

  if (phone) {
    const phoneExists = await Organizations.findOne({ where: { phone } });
    if (phoneExists) {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Phone number already in use');
    }
  }
};

/**
 * Deletes a document from an organization.
 * @param {number} organization_id - The ID of the organization.
 * @param {number} doc_id - The ID of the document to be deleted.
 * @returns {Promise<boolean>} - A promise that resolves to a boolean indicating whether the document was successfully deleted.
 * @throws {ApiError} - If the document was not deleted, an ApiError with status code 406 (Not Acceptable) is thrown.
 */
const dropDoc = async (organization_id, doc_id) => {
  const is_deleted = await OrganizationDocs.destroy({ where: { id: doc_id, organization_id: organization_id } });
  if (is_deleted) {
    return is_deleted;
  } else {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Not Deleted !');
  }
};

const manageOrganizationDoc = async (organization_id, doc_id, doc) => {
  const isOrgExist = await showOne(organization_id);
  if (!isOrgExist) {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Organization not found !');
  }
  const isDocExist = await OrganizationDocs.findOne({ where: { id: doc_id, organization_id: organization_id } });
  if (!isDocExist) {
    // throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Document not found !');
    const newDoc = await createDocument(
      organization_id,
      doc.title,
      doc.description,
      doc.file_name,
      doc.disk_name,
      doc.expiry_date
    );
    return newDoc;
  }
  const is_updated = await OrganizationDocs.update(doc, { where: { id: doc_id, organization_id: organization_id } });
  if (is_updated) {
    const updatedOrganizationDetails = await OrganizationDocs.findOne({
      where: { id: doc_id, organization_id: organization_id },
    });
    return updatedOrganizationDetails;
  } else {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Not Updated !');
  }
};

const linkOrUnlinkApps = async (organization_id, app_id, action) => {
  const isLinkExist = await organizationApps.findOne({ where: { organization_id: organization_id, app_id: app_id } });
  // return action;
  if (!isLinkExist && action === 'link') {
    const is_created = await organizationApps.create({ organization_id: organization_id, app_id: app_id });
    return is_created;
  } else if (action === 'unlink') {
    const is_deleted = await organizationApps.destroy({ where: { organization_id: organization_id, app_id: app_id } });
    if (is_deleted) {
      return is_deleted;
    } else {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Ubable to Unlink !');
    }
  } else {
    throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Something went wrong !');
  }
};

const statusChange = async (organization_id, action) => {
  try {
    const organization = await Organizations.findByPk(organization_id);
    if (!organization) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Organization not found');
    }

    if (action === 'enable') {
      organization.is_active = true;
    } else if (action === 'disable') {
      organization.is_active = false;
    } else {
      throw new ApiError(httpStatus.NOT_ACCEPTABLE, 'Invalid action');
    }

    await organization.save();
    return organization;
  } catch (error) {
    console.error('Error changing status:', error);
    throw new ApiError(httpStatus.INTERNAL_SERVER_ERROR, 'Internal Server Error');
  }
};



// const getOrganizationDocuments = async ( organization_id ) => {
//   try {

//     // Fetch documents for the specified organization ID
//     const organization_docs = await OrganizationDocs.findAll({
//       where: { organization_id: organization_id },
//     });
//     // Return the result in the expected structure
//     if (!organization_docs || organization_docs.length === 0) {
//       return { organization_docs: { result: [] } }; // Ensures empty result in expected structure
//     }
//     return { organization_docs: { result: organization_docs } };
//   } catch (error) {
//     // Handle errors gracefully and provide feedback
//     console.error("Error fetching organization documents:", error);
//     throw new Error("Failed to fetch organization documents");
//   }
// };



// const getOrganizationDocuments = async (organization_id) => {
//   // fetch the documents related to the entity
//   const documents = await OrganizationDocs.findAll({
//     where: { organization_id: organization_id },
//   });


//   return documents;
// };

// const getOrganizationDocuments = async (paginationOptions,organization_id) => {
//   const { page, limit, search, filters, condition, sortBy, sortOrder } = paginationOptions;
//   const offset = (page - 1) * limit;

//   const searchFields = [
//     'title',
//     'description',
//     'file_name',
//     'file_type',
//     'file_size',
//     'disk_name',
//     'expiry_date'
//   ];

//   // search condition using the utility
//   const searchCondition = await buildSearchCondition(search, searchFields, userService);
//   const whereCondition = [];
//   if (searchCondition) {
//     whereCondition.push(searchCondition);
//   }

//   // fetch the documents related to the entity
//   const documents = await OrganizationDocs.findAll({
//     where: { organization_id: organization_id },
//   });
// console.log('documents gg');
// console.log(documents);


//   return documents;
// };





const getOrganizationDocuments = async (organization_id, searchQuery) => {
  console.log('Fetching documents for organization ID:', organization_id);

  const searchFields = [
    'title',
    'description',
    'file_name',
    'file_type',
    'file_size',
    'disk_name',
    'expiry_date',
  ];

  // Build the query object
  const query = {
    where: { organization_id },
  };

  // If a search term is provided, add filtering logic
  if (searchQuery) {
    query.where[Op.or] = searchFields.map((field) => ({
      [field]: { [Op.like]: `%${searchQuery}%` },
    }));
  }
  try {
    // Fetch the documents related to the organization
    console.log('print query value');
    console.log(query);
    const documents = await OrganizationDocs.findAll(query);
    
    return documents;
  } catch (error) {
    console.error('Error fetching documents:', error);
    throw error;
  }
};


// Service to download a document by serverFileName
const downloadDocument = async ({ documentId, res }) => {
  const document = await models.organizationDocs.findOne({ where: { id: documentId } });

  if (!document) {
    throw new ApiError(HttpStatusCode.NotFound, 'Document not found');
  }


  // Construct the file path
  const filePath = path.resolve(__dirname, '../../../uploads/organization/docs', document.disk_name);


  if (!fs.existsSync(filePath)) {
    throw new ApiError(HttpStatusCode.NotFound, 'File not found on server');
  }

  // Set headers to initiate download with original `file_name`
  res.setHeader("Content-Disposition", `attachment; filename="${document.file_name}"`);
  res.header("Access-Control-Expose-Headers", "Content-Disposition");
  res.setHeader("Content-Type", document.file_type);

  // Stream the file to the client
  const fileStream = fs.createReadStream(filePath);

  fileStream
    .pipe(res)
    .on("error", (err) => {
      console.error("Error downloading file", err);
      res.status(500).send("Error downloading file");
    })
    .on("end", () => {
      console.info("File downloaded", { user: userId, fileId: document.id });
    });
};

// delete document and its entries and thumbnails associated with it
const deleteDocument = async ({ documentId }) => {
  const document = await models.organizationDocs.findByPk(documentId);
  if (!document) {
    throw new ApiError(HttpStatusCode.NotFound, 'Document not found');
  }

  // Define the paths to both the document file and its thumbnail
  const filePath = path.resolve(__dirname, '../../../uploads/organization/docs', document.disk_name);
  const thumbnailPath = path.resolve(__dirname, '../../../uploads/thumbnails/', `thumb_${document.disk_name}`);

  // delete the document file if it exists
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }

  // delete the associated thumbnail if exists
  if (fs.existsSync(thumbnailPath)) {
    fs.unlinkSync(thumbnailPath);
  }

  // delete the document entry from the database
  await models.organizationDocs.destroy({
    where: {
      id: documentId,
    },
  });
};


module.exports = {
  list,
  create,
  edit,
  drop,
  statusChange,
  createDocument,
  showOne,
  getOneUserForOrganization,
  getAllUserForOrganization,
  dropDoc,
  manageOrganizationDoc,
  linkOrUnlinkApps,
  getOrganizationDocuments,
  downloadDocument,
  deleteDocument
};
