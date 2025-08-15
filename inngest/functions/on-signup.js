import { inngest } from "../client";
import User from "../../models/User";
import { NonRetriableError } from "inngest";

export const onUserSignUp = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;
      const user = await step.run("get-user-email", async () => {
        const userObject = await User.findOne({ email });
        if (!userObject) {
          throw new NonRetriableError("User not found");
        }
        return userObject;
      });
      
      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to our platform, ${user.name}!`;
        const message = `Hi ${user.name},\n\nThank you for signing up! We're excited to have you on board.\n\nBest regards,\nThe Team`;

        await sendEmail(user.email, subject, message);
      });

      return { success: true };
    } catch (error) {
      step.fail("get-user-email", error);
      return { success: false };
    }
  }
);
