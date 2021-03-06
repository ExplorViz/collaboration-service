package net.explorviz.vr.message;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.exc.MismatchedInputException;
import com.fasterxml.jackson.databind.exc.UnrecognizedPropertyException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import javax.websocket.DecodeException;
import javax.websocket.Decoder;
import javax.websocket.Encoder;
import javax.websocket.EndpointConfig;
import net.explorviz.collaboration.message.ReceivableMessageDecoder;
import net.explorviz.collaboration.message.receivable.AppClosedMessage;
import net.explorviz.collaboration.message.receivable.AppOpenedMessage;
import net.explorviz.collaboration.message.receivable.ComponentUpdateMessage;
import net.explorviz.collaboration.message.receivable.ObjectGrabbedMessage;
import net.explorviz.collaboration.message.receivable.ObjectMovedMessage;
import net.explorviz.collaboration.message.receivable.ObjectReleasedMessage;
import net.explorviz.collaboration.message.receivable.SpectatingUpdateMessage;
import net.explorviz.collaboration.message.receivable.UserPositionsMessage;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

public class ReceivableMessageDecoderTest {
  private ReceivableMessageDecoder decoder;

  @BeforeEach
  void initDecoder() {
    this.decoder = new ReceivableMessageDecoder();
    this.decoder.init(new EndpointConfig() {
      @Override
      public Map<String, Object> getUserProperties() {
        return new HashMap<>();
      }

      @Override
      public List<Class<? extends Encoder>> getEncoders() {
        return new ArrayList<>();
      }

      @Override
      public List<Class<? extends Decoder>> getDecoders() {
        return Arrays.asList(ReceivableMessageDecoder.class);
      }
    });
  }

  @AfterEach
  void destroyDecoder() {
    this.decoder.destroy();
    this.decoder = null;
  }

  @Test
  public void testTrailingToken() {
    final var json = "{ \"event\": \"app_closed\", \"appId\": \"foo\" } \"extra token\"";
    assertThrows(MismatchedInputException.class, () -> this.decoder.decodeMessage(json));
  }

  @Test
  public void testUnknownMessage() {
    final var json = "{ \"event\": \"unknown\" }";
    assertThrows(JsonMappingException.class, () -> this.decoder.decodeMessage(json));
  }

  @Test
  public void testMissingField() throws DecodeException, IOException {
    final var json = "{ \"event\": \"app_closed\" }";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new AppClosedMessage();
    expected.setEvent("app_closed");
    expected.setAppId(null);
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }

  @Test
  public void testExtraField() throws DecodeException, IOException {
    final var json = "{ \"event\": \"app_closed\", \"appId\": \"foo\", \"foo\": \"bar\" }";
    assertThrows(UnrecognizedPropertyException.class, () -> this.decoder.decodeMessage(json));
  }

  @Test
  public void testAppClosesdMessage() throws DecodeException, IOException {
    final var json = "{ \"event\": \"app_closed\", \"appId\": \"foo\" }";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new AppClosedMessage();
    expected.setAppId("foo");
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }

  @Test
  public void testObjectGrabbedMessage() throws DecodeException, IOException {
    final var json = "{ \"event\": \"object_grabbed\", \"nonce\": \"1\", \"objectId\": \"foo\"}";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new ObjectGrabbedMessage();
    expected.setNonce(1);
    expected.setObjectId("foo");
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }

  @Test
  public void testAppOpenedMessage() throws DecodeException, IOException {
    final var json = "{" //
        + "  \"event\": \"app_opened\"," //
        + "  \"id\": \"foo\"," //
        + "  \"position\": [1.0, 2.0, 3.0]," //
        + "  \"quaternion\": [1.0, 2.0, 3.0, 4.0]" //
        + "}";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new AppOpenedMessage();
    expected.setId("foo");
    expected.setPosition(new double[] {1.0, 2.0, 3.0});
    expected.setQuaternion(new double[] {1.0, 2.0, 3.0, 4.0});
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }

  @Test
  public void testObjectReleasedMessage() throws DecodeException, IOException {
    final var json = "{ \"event\": \"object_released\", \"objectId\": \"foo\" }";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new ObjectReleasedMessage();
    expected.setObjectId("foo");
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }

  @Test
  public void testObjectMovedMessage() throws DecodeException, IOException {
    final var json = "{" //
        + "  \"event\": \"object_moved\"," //
        + "  \"objectId\": \"foo\"," //
        + "  \"position\": [1.0, 2.0, 3.0]," //
        + "  \"quaternion\": [1.0, 2.0, 3.0, 4.0]" //
        + "}";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new ObjectMovedMessage();
    expected.setObjectId("foo");
    expected.setPosition(new double[] {1.0, 2.0, 3.0});
    expected.setQuaternion(new double[] {1.0, 2.0, 3.0, 4.0});
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }

  @Test
  public void testComponentUpdateMessage() throws DecodeException, IOException {
    final var json = "{" //
        + "  \"event\": \"component_update\"," //
        + "  \"appId\": \"foo\"," //
        + "  \"componentId\": \"bar\"," //
        + "  \"isOpened\": true," //
        + "  \"isFoundation\": true" //
        + "}";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new ComponentUpdateMessage();
    expected.setAppId("foo");
    expected.setComponentId("bar");
    expected.setIsOpened(true);
    expected.setIsFoundation(true);
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }

  @Test
  public void testSpectatingUpdateMessage() throws DecodeException, IOException {
    final var json = "{" //
        + "  \"event\": \"spectating_update\"," //
        + "  \"userId\": \"foo\"," //
        + "  \"isSpectating\": true," //
        + "  \"spectatedUser\": \"bar\"" //
        + "}";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new SpectatingUpdateMessage();
    expected.setUserId("foo");
    expected.setIsSpectating(true);
    expected.setSpectatedUser("bar");
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }

  @Test
  public void testUserPositionsMessage() throws DecodeException, IOException {
    final var json = "{" //
        + "  \"event\": \"user_positions\"," //
        + "  \"controller1\": {" //
        + "    \"position\": [1.0, 2.0, 3.0]," //
        + "    \"quaternion\": [1.0, 2.0, 3.0, 4.0]" //
        + "  }," //
        + "  \"controller2\": {" //
        + "    \"position\": [1.0, 2.0, 3.0]," //
        + "    \"quaternion\": [1.0, 2.0, 3.0, 4.0]" //
        + "  }," //
        + "  \"camera\": {" //
        + "    \"position\": [1.0, 2.0, 3.0]," //
        + "    \"quaternion\": [1.0, 2.0, 3.0, 4.0]" //
        + "  }" //
        + "}";
    final var actual = this.decoder.decodeMessage(json);
    final var expected = new UserPositionsMessage();
    expected.setController1(new UserPositionsMessage.ControllerPose());
    expected.getController1().setPosition(new double[] {1.0, 2.0, 3.0});
    expected.getController1().setQuaternion(new double[] {1.0, 2.0, 3.0, 4.0});
    expected.setController2(new UserPositionsMessage.ControllerPose());
    expected.getController2().setPosition(new double[] {1.0, 2.0, 3.0});
    expected.getController2().setQuaternion(new double[] {1.0, 2.0, 3.0, 4.0});
    expected.setCamera(new UserPositionsMessage.Pose());
    expected.getCamera().setPosition(new double[] {1.0, 2.0, 3.0});
    expected.getCamera().setQuaternion(new double[] {1.0, 2.0, 3.0, 4.0});
    assertThat(actual).hasSameClassAs(expected).usingRecursiveComparison().isEqualTo(expected);
  }
}
