export async function enableNotifications() {
  try {
    if (!window.OneSignalDeferred) {
      return {
        ok: false,
        message: "OneSignal غير جاهز"
      };
    }

    window.OneSignalDeferred.push(async function (OneSignal) {
      await OneSignal.Notifications.requestPermission();

      if (OneSignal.User.PushSubscription) {
        await OneSignal.User.PushSubscription.optIn();
      }
    });

    return {
      ok: true,
      message: "تم إرسال طلب تفعيل الإشعارات"
    };

  } catch (error) {
    console.error(error);

    return {
      ok: false,
      message: "فشل تفعيل الإشعارات"
    };
  }
}
