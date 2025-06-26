import express from "express";
import { prismaClient } from "@repo/db/config";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { jwtSecret } from "@repo/common-backend/jwtSecret"
import { AuthenticatedRequest, userMiddleware } from "./userMiddleware";
import { createRoomSchema, createChatSchema } from "@repo/common/types";

const app = express();
app.use(express.json())

app.get("/", (req, res) => {
  res.status(200).json({
    message: "This is the source repository, check for the required repositories in this domain"
  })
});

// copy signin and signup here
app.post("/signup", async (req, res) => {

  const { name, email, password } = req.body;

  if(!name || !email || !password) {
    res.status(400).json({
      message: "name, email and password are required"
    })
    return;
  }

  try{
    const existingUser = await prismaClient.user.findUnique({
      where: {
        email
      }
    });

    if(existingUser) {
      res.status(409).json({
        message: "User already exists with given email, try signing in"
      });
      return;
    }
  }
  catch(error) {
    res.status(400).json({
      message: "Error while checking existing users",
      error: (error as any).message
    })
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prismaClient.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    })

    console.log("Logging jwtSecret for debugging: ", jwtSecret);

    if(!jwtSecret) {
      res.status(201).json({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        token: "There is problem generating token in /signup."
      })
      return;
    }

    const token = jwt.sign(
      { userId: newUser.id, email: newUser.email },
      jwtSecret,
      { expiresIn: '7d'}
    )

    res.status(201).json({
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      token: token
    });
  } 
  catch(error) {
    console.log("Error while creating user: ", error);
    res.status(500).json({ error: "Failed to create user"})
  }
})

app.post("/signin", async (req, res) => {
  try{

    const { email, password } = req.body;

    if(!email || !password) {
      res.status(400).json({
        message: "email and password are required"
      })
      return;
    }

    const dbCheck = await prismaClient.user.findFirst({
      where: {
        email
      }
    });

    if(!dbCheck) {
      res.status(404).json({
        message: "User not found"
      })
      return;
    }

    if(!dbCheck.password) {
      res.status(404).json({
        message: "Password doesn't exist for the given user"
      })
      return;
    }

    const passCheck = await bcrypt.compare(password, dbCheck?.password)

    if(passCheck) {

      if(!jwtSecret) {
        console.log("dev: Undefined jwt secret");
        return;
      }
      const token = jwt.sign(
        { userId: dbCheck.id, email: dbCheck.email },
        jwtSecret,
        { expiresIn: '7d'}
      )
      res.status(200).json({
        id: dbCheck.id,
        name: dbCheck.name,
        email:dbCheck.email,
        token: token
      })
    }

  }
  catch(error) {
    console.log("Error: ", error);
  }
})


// create a room.
app.post("/room", userMiddleware, async (req: AuthenticatedRequest, res) => {
  
  const parsedData = createRoomSchema.safeParse(req.body);
  if(!parsedData.success) {
    console.log(req.body);
    console.log("error: ", parsedData.error);
    res.status(404).json({
      message: "slug has to be unique"
    });
    return;
  }
  const adminId = req.userId;
  if(!adminId) {
    res.status(402).json({
      message: "User not authenticated"
    })
    return;
  }
  
  try{
    const slug = parsedData.data.slug;
    const room = await prismaClient.room.create({
      data: {
        adminId,
        slug
      }
    });
    res.status(201).json({
      roomId: room.id,
      slug
    });
  } catch (error) {
    console.log("Error white creating a room, given slug: ", error);
    res.status(500).json({
      message: "server error while creating room"
    });
  }
});

// two routes copied from Kirat. made another route based on this route on own. if that doesn't work, try this.

// app.get("/room/:slug", (req, res) => {
//   const slug = req.params.slug;
//   try {
//     const room = prismaClient.room.findFirst({
//       where: {
//         slug
//       }
//     });

//     res.status(200).json({
//       room
//     });

//   } catch(error) {
//     res.status(404).json({
//       message: "slug not found"
//     });
//   }
// });

// app.get("/chats/:roomId", async (req, res) => {
//   const roomId = Number(req.params.roomId);
//   try{
//     const messages = await prismaClient.chats.findMany({
//       where: {
//         roomId
//       },
//       orderBy: {
//         id: "desc"
//       },
//       take: 500
//     });
//     res.status(200).json({
//       messages
//     })
//   } catch(error) {
//     res.status(400).json({
//       message: "invalid roomId"
//     })
//   }

// });

// if slug is made unique and foreign key in chats table.

app.post("/chats/:slug", userMiddleware, async (req: AuthenticatedRequest, res) => {
  const slug = req.params.slug;
  if(!slug) {
    return;
  }
  console.log("Slug from post /chats/:slug", slug);
  const parsedData = createChatSchema.safeParse(req.body);
  if(!parsedData.success) {
    res.status(400).json({
      error: parsedData.error
    });
    return;
  }

  const userId = req.userId;
  if(!userId) return;
  try {
    const result = await prismaClient.chats.create({
      data: {
        message: parsedData.data.message,
        slug: slug,
        userId 
      }
    });

    res.status(201).json({
      result: "successfully added chat to database"
    });
  } catch(error) {
    res.status(400).json({
      error: error
    });
    return;
  }
});

app.get("/chats/:slug", userMiddleware, async (req, res) => {
  const slug = req.params.slug;
  console.log("Slug from get /chats/:slug", slug);
  try {
    const messages = await prismaClient.chats.findMany({
      where: {
        slug
      }
    });

    res.status(200).json({
      messages
    });
    return;
  } catch(error) {
    res.status(400).json({
      message: "Invalid slug"
    });
    return;
  }
})

app.listen(3001, () => {
  console.log("Listening on port 3001");
});