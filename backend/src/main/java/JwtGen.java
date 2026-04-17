import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import java.util.Date;

public class JwtGen {
    public static void main(String[] args) {
        String jwtSecret = "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";
        String token = Jwts.builder()
                .setSubject("test@test.com")
                .claim("role", "USER")
                .setIssuedAt(new Date())
                .setExpiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(Keys.hmacShaKeyFor(jwtSecret.getBytes()), SignatureAlgorithm.HS512)
                .compact();
        System.out.println(token);
    }
}
